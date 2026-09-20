/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Lavelle Hatcher Jr */
/* Whole-account backup. Runs as a full tab so it survives clicking elsewhere,
   which a job of several hundred conversations will. */

'use strict';

/* ============================== ZIP WRITER ==============================
   Stored entries only, no deflate, so there is no library to pull in. A few
   hundred markdown files are small enough that it hardly matters. */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function crc32(bytes) {
  let crc = -1;
  for (let i = 0; i < bytes.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xFF];
  return (crc ^ -1) >>> 0;
}

function dosTime(d) {
  return ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((d.getSeconds() / 2) & 31);
}
function dosDate(d) {
  return (((d.getFullYear() - 1980) & 127) << 9) | (((d.getMonth() + 1) & 15) << 5) | (d.getDate() & 31);
}

/* files: [{ name, text }] -> Blob */
function makeZip(files) {
  const enc = new TextEncoder();
  const now = new Date();
  const t = dosTime(now), dt = dosDate(now);
  const parts = [];       // Uint8Array pieces, concatenated by Blob at the end
  const central = [];
  let offset = 0;

  for (const f of files) {
    const nameBytes = enc.encode(f.name);
    const data = enc.encode(f.text);
    const crc = crc32(data);

    const lh = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(lh.buffer);
    lv.setUint32(0, 0x04034b50, true);   // local file header signature
    lv.setUint16(4, 20, true);           // version needed
    lv.setUint16(6, 0x0800, true);       // flag: UTF-8 filenames
    lv.setUint16(8, 0, true);            // method: store
    lv.setUint16(10, t, true);
    lv.setUint16(12, dt, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true); // compressed size
    lv.setUint32(22, data.length, true); // uncompressed size
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);           // extra field length
    lh.set(nameBytes, 30);

    const cd = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true);   // central directory signature
    cv.setUint16(4, 20, true);           // version made by
    cv.setUint16(6, 20, true);           // version needed
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, t, true);
    cv.setUint16(14, dt, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);           // extra
    cv.setUint16(32, 0, true);           // comment
    cv.setUint16(34, 0, true);           // disk number
    cv.setUint16(36, 0, true);           // internal attrs
    cv.setUint32(38, 0, true);           // external attrs
    cv.setUint32(42, offset, true);      // offset of local header
    cd.set(nameBytes, 46);

    parts.push(lh, data);
    central.push(cd);
    offset += lh.length + data.length;
  }

  let cdSize = 0;
  for (const c of central) cdSize += c.length;

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);     // end of central directory
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, central.length, true);
  ev.setUint16(10, central.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  return new Blob(parts.concat(central, [eocd]), { type: 'application/zip' });
}

/* ============================== HELPERS ============================== */

function safeName(s, max) {
  return String(s == null ? '' : s)
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[\/\\:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^[.\s]+|[.\s]+$/g, '')
    .slice(0, max || 80) || 'untitled';
}

function stamp(d) {
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function dayOf(iso) {
  const d = new Date(iso || 0);
  return isFinite(d.getTime()) && d.getTime() > 0 ? stamp(d) : '0000-00-00';
}

async function getJson(url, headers) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: Object.assign({ accept: 'application/json' }, headers || {})
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ============================== PLATFORMS ============================== */

const PLATFORMS = {
  claude: {
    label: 'Claude',
    origin: 'https://claude.ai',

    async list(onProgress) {
      let orgs = await getJson('https://claude.ai/api/organizations');
      if (!Array.isArray(orgs)) orgs = orgs.organizations || [];
      const ids = orgs.map((o) => o && o.uuid).filter(Boolean);
      if (!ids.length) throw new Error('No organization found. Sign in to claude.ai first.');

      const seen = new Set();
      const out = [];
      for (const org of ids) {
        let offset = 0;
        for (;;) {
          let page;
          try {
            page = await getJson('https://claude.ai/api/organizations/' + org +
              '/chat_conversations?limit=50&offset=' + offset);
          } catch (e) { break; }
          const items = Array.isArray(page) ? page : (page.items || page.data || []);
          if (!items.length) break;
          for (const c of items) {
            if (!c || !c.uuid || seen.has(c.uuid)) continue;
            seen.add(c.uuid);
            out.push({ id: c.uuid, org: org, title: c.name || '', at: c.updated_at || c.created_at || '' });
          }
          onProgress(out.length);
          if (items.length < 50) break;
          offset += 50;
          await sleep(120);
        }
      }
      return out;
    },

    projectCache: {},

    // Undocumented, so probe every spelling. Absent means omit it.
    projectRefOf(j) {
      const p = j.project || j.chat_project || j.project_metadata;
      if (p && typeof p === 'object') {
        return { id: String(p.uuid || p.id || ''), name: String(p.name || p.title || '').trim() };
      }
      const id = j.project_uuid || j.project_id || j.projectUuid || j.projectId;
      return id ? { id: String(id), name: '' } : null;
    },

    async projects(org) {
      if (this.projectCache[org]) return this.projectCache[org];
      const map = new Map();
      for (const url of ['https://claude.ai/api/organizations/' + org + '/projects?limit=100',
                         'https://claude.ai/api/organizations/' + org + '/projects']) {
        try {
          let j = await getJson(url);
          if (!Array.isArray(j)) j = j.items || j.data || j.projects || [];
          for (const pr of j) {
            const id = pr && (pr.uuid || pr.id);
            const nm = pr && (pr.name || pr.title);
            if (id && nm) map.set(String(id), String(nm).trim());
          }
          if (map.size) break;
        } catch (e) { /* endpoint absent; fall back to a flat layout */ }
      }
      this.projectCache[org] = map;
      return map;
    },

    async fetchOne(c) {
      const j = await getJson('https://claude.ai/api/organizations/' + c.org +
        '/chat_conversations/' + c.id + '?tree=True&rendering_mode=messages&render_all_tools=true');
      const raw = j.chat_messages || j.messages || [];
      const msgs = [];
      for (const m of raw) {
        const parts = [];
        if (Array.isArray(m.content)) {
          for (const b of m.content) {
            if (!b || typeof b !== 'object') continue;
            if (b.type === 'text' && typeof b.text === 'string') parts.push(b.text);
            else if (b.type === 'thinking' && b.thinking && String(b.thinking).trim()) {
              parts.push('<details><summary>Thinking</summary>\n\n' + String(b.thinking).trim() + '\n\n</details>');
            } else if (b.type === 'tool_use' && b.name) parts.push('`[tool: ' + b.name + ']`');
          }
        }
        let md = parts.join('\n\n').trim();
        if (!md && typeof m.text === 'string') md = m.text.trim();
        const files = [].concat(m.attachments || [], m.files || [])
          .map((f) => f && (f.file_name || f.name || f.filename)).filter(Boolean);
        if (files.length) md += (md ? '\n\n' : '') + '*Attached: ' + files.join(', ') + '*';
        if (!md) continue;
        msgs.push({
          role: (m.sender === 'human' || m.sender === 'user') ? 'user' : 'assistant',
          md: md, at: m.created_at || ''
        });
      }
      let project = '';
      const ref = this.projectRefOf(j);
      if (ref) {
        project = ref.name;
        if (!project && ref.id) project = (await this.projects(c.org)).get(ref.id) || '';
      }
      return {
        title: (j.name || c.title || '').trim() || 'Untitled chat',
        url: 'https://claude.ai/chat/' + c.id,
        project: project,
        model: (j.model || '').trim(),
        messages: msgs
      };
    }
  },

  chatgpt: {
    label: 'ChatGPT',
    origin: 'https://chatgpt.com',
    token: null,

    async auth() {
      const s = await getJson('https://chatgpt.com/api/auth/session');
      if (!s || !s.accessToken) throw new Error('Not signed in to ChatGPT.');
      this.token = s.accessToken;
      return this.token;
    },

    async list(onProgress) {
      await this.auth();
      const hdr = { authorization: 'Bearer ' + this.token };
      const out = [];
      let offset = 0;
      for (;;) {
        const page = await getJson(
          'https://chatgpt.com/backend-api/conversations?offset=' + offset + '&limit=100&order=updated', hdr);
        const items = (page && page.items) || [];
        if (!items.length) break;
        for (const c of items) {
          if (!c || !c.id) continue;
          out.push({ id: c.id, title: c.title || '', at: c.update_time || c.create_time || '' });
        }
        onProgress(out.length);
        const total = page.total != null ? page.total : Infinity;
        if (items.length < 100 || out.length >= total) break;
        offset += 100;
        await sleep(120);
      }
      return out;
    },

    async fetchOne(c) {
      const hdr = { authorization: 'Bearer ' + this.token };
      const j = await getJson('https://chatgpt.com/backend-api/conversation/' + c.id, hdr);
      const map = j.mapping || {};
      const chain = [];
      const seen = new Set();
      let id = j.current_node;
      while (id && map[id] && !seen.has(id)) { seen.add(id); chain.push(map[id]); id = map[id].parent; }
      chain.reverse();
      const msgs = [];
      for (const node of chain) {
        const m = node.message;
        if (!m || !m.author) continue;
        const role = m.author.role;
        if (role !== 'user' && role !== 'assistant') continue;
        if ((m.metadata || {}).is_visually_hidden_from_conversation) continue;
        const ct = m.content || {};
        const strs = (ct.parts || []).filter((p) => typeof p === 'string');
        let md = ct.content_type === 'code'
          ? '```' + (ct.language && ct.language !== 'unknown' ? ct.language : '') + '\n' + (ct.text || strs.join('\n')) + '\n```'
          : (strs.length ? strs.join('\n\n') : (typeof ct.text === 'string' ? ct.text : ''));
        md = md.trim();
        if (!md) continue;
        msgs.push({ role: role, md: md, at: m.create_time ? new Date(m.create_time * 1000).toISOString() : '' });
      }
      const at = c.at ? (typeof c.at === 'number' ? new Date(c.at * 1000).toISOString() : c.at) : '';
      return {
        title: (j.title || c.title || '').trim() || 'Untitled chat',
        url: 'https://chatgpt.com/c/' + c.id,
        messages: msgs, at: at
      };
    }
  }
};

/* ============================== MARKDOWN ============================== */

function labelFor(role, platform) {
  if (role === 'user') return 'You';
  if (role === 'assistant') return platform;
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function convoMarkdown(conv, platform) {
  const out = ['# ' + conv.title, ''];
  out.push('| | |', '|---|---|');
  out.push('| **Source** | ' + conv.url + ' |');
  out.push('| **Platform** | ' + platform + ' |');
  if (conv.project) out.push('| **Project** | ' + conv.project.replace(/\|/g, '\\|') + ' |');
  if (conv.model) out.push('| **Model** | ' + conv.model + ' |');
  out.push('| **Messages** | ' + conv.messages.length + ' |');
  out.push('| **Exported** | ' + new Date().toISOString() + ' |');
  out.push('| **Method** | Site transcript API (complete) |');
  out.push('', '---', '');
  for (const m of conv.messages) {
    out.push('## ' + labelFor(m.role, platform));
    if (m.at) out.push('', '*' + m.at + '*');
    out.push('', m.md, '', '---', '');
  }
  return out.join('\n').replace(/\n{4,}/g, '\n\n\n').trimEnd() + '\n';
}

function mdToText(md) {
  const out = [];
  let inFence = false;
  for (const raw of md.split('\n')) {
    if (/^\s*(`{3,}|~{3,})/.test(raw)) { inFence = !inFence; continue; }
    if (inFence) { out.push('    ' + raw); continue; }
    let l = raw;
    l = l.replace(/^(\s*)#{1,6}\s+/, '$1');
    l = l.replace(/!\[([^\]]*)\]\([^)]*\)/g, '[image: $1]');
    l = l.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 <$2>');
    l = l.replace(/\*\*([^*]+)\*\*/g, '$1');
    l = l.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1$2');
    l = l.replace(/~~([^~]+)~~/g, '$1');
    l = l.replace(/`([^`]+)`/g, '$1');
    l = l.replace(/^\s*>\s?/, '  ');
    l = l.replace(/<\/?details>|<\/?summary>/g, '');
    out.push(l);
  }
  return out.join('\n');
}

function convoText(conv, platform) {
  const bar = '='.repeat(66);
  const out = [bar, conv.title, bar, ''];
  out.push('Source:    ' + conv.url);
  out.push('Platform:  ' + platform);
  if (conv.project) out.push('Project:   ' + conv.project);
  if (conv.model) out.push('Model:     ' + conv.model);
  out.push('Messages:  ' + conv.messages.length);
  out.push('Exported:  ' + new Date().toISOString());
  out.push('Method:    Site transcript API (complete)');
  out.push('');
  for (const m of conv.messages) {
    out.push('-'.repeat(66));
    out.push('  ' + labelFor(m.role, platform).toUpperCase() + (m.at ? '   ' + m.at : ''));
    out.push('-'.repeat(66), '');
    out.push(mdToText(m.md).trim(), '');
  }
  return out.join('\n').replace(/\n{4,}/g, '\n\n\n').trimEnd() + '\n';
}

function indexText(rows, platform) {
  const out = [platform + ' backup — ' + stamp(new Date()),
               '='.repeat(66), '', rows.length + ' conversations.', ''];
  for (const r of rows) {
    out.push((r.day || '').padEnd(12) + String(r.count).padStart(4) + ' msgs   ' +
             (r.project ? '[' + r.project + '] ' : '') + r.title);
  }
  return out.join('\n') + '\n';
}

function indexMarkdown(rows, platform) {
  const out = ['# ' + platform + ' backup — ' + stamp(new Date()), ''];
  out.push(rows.length + ' conversations.', '');
  const anyProject = rows.some((r) => r.project);
  out.push(anyProject ? '| Date | Project | Messages | Conversation | File |'
                      : '| Date | Messages | Conversation | File |');
  out.push(anyProject ? '|---|---|---|---|---|' : '|---|---|---|---|');
  for (const r of rows) {
    const cells = [r.day || ''];
    if (anyProject) cells.push((r.project || '—').replace(/\|/g, '\\|'));
    cells.push(String(r.count), r.title.replace(/\|/g, '\\|'),
               '`' + r.file.replace(/\|/g, '\\|') + '.md`');
    out.push('| ' + cells.join(' | ') + ' |');
  }
  return out.join('\n') + '\n';
}

/* ============================== UI / RUN ============================== */

const $ = (id) => document.getElementById(id);
let running = false;

/* ---- format preference, shared with the popup ----
   Both pages sit on the same extension origin, so one key covers both and
   survives a restart. try/catch because storage can be blocked, in which case
   the defaults apply. */
const FMT_KEY = 'chatArchiver.formats';

function loadFormats() {
  try {
    const v = JSON.parse(localStorage.getItem(FMT_KEY) || 'null');
    // Never restore "neither". It leaves the button dead on open.
    if (v && typeof v.md === 'boolean' && typeof v.txt === 'boolean' && (v.md || v.txt)) return v;
  } catch (e) { /* storage blocked; defaults apply */ }
  return null;
}

function saveFormats() {
  const md = document.getElementById('fmt-md').checked;
  const txt = document.getElementById('fmt-txt').checked;
  if (!md && !txt) return;          // transient state, not worth remembering
  try { localStorage.setItem(FMT_KEY, JSON.stringify({ md: md, txt: txt })); } catch (e) {}
}

function applyFormats() {
  const v = loadFormats();
  if (!v) return;
  document.getElementById('fmt-md').checked = v.md;
  document.getElementById('fmt-txt').checked = v.txt;
}


function log(text, cls) {
  const d = document.createElement('div');
  if (cls) d.className = cls;
  d.textContent = text;
  $('log').appendChild(d);
  $('log').scrollTop = $('log').scrollHeight;
}
function setBar(done, total) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  $('bar').style.width = pct + '%';
  $('pct').textContent = total ? (done + ' / ' + total + '  (' + pct + '%)') : '';
}

async function run() {
  if (running) return;
  const key = document.querySelector('input[name=plat]:checked').value;
  const P = PLATFORMS[key];
  const wantMd = document.getElementById('fmt-md').checked;
  const wantTxt = document.getElementById('fmt-txt').checked;
  if (!wantMd && !wantTxt) { log(t('pickFormat'), 'err'); return; }
  running = true;
  $('go').disabled = true;
  $('go').textContent = t('backingUp');
  $('log').textContent = '';
  $('progress').style.display = 'block';
  setBar(0, 0);

  const failures = [];
  try {
    log(t('listing', P.label));
    const convos = await P.list((n) => { $('pct').textContent = t('findingN', n); });
    if (!convos.length) throw new Error(t('noConvos', P.label));
    log(t('foundConvos', convos.length), 'ok');

    const files = [];
    const rows = [];
    const used = new Set();
    let done = 0;

    for (const c of convos) {
      try {
        const conv = await P.fetchOne(c);
        const day = dayOf(conv.at || c.at || '');
        // De-dupe on the stem so a chat's .md and .txt keep the same name.
        let stem = day + ' - ' + safeName(conv.title, 70);
        let n = 2;
        while (used.has(stem.toLowerCase())) { stem = day + ' - ' + safeName(conv.title, 70) + ' (' + (n++) + ')'; }
        used.add(stem.toLowerCase());
        // Project chats get a folder of their own. Everything else stays flat
        // under conversations/.
        const dir = conv.project ? 'projects/' + safeName(conv.project, 60) + '/' : 'conversations/';
        if (wantMd) files.push({ name: dir + stem + '.md', text: convoMarkdown(conv, P.label) });
        if (wantTxt) files.push({ name: dir + stem + '.txt', text: convoText(conv, P.label) });
        rows.push({ day: day, count: conv.messages.length, title: conv.title,
                    file: dir + stem, project: conv.project || '' });
      } catch (e) {
        failures.push((c.title || c.id) + ' — ' + (e && e.message ? e.message : String(e)));
      }
      done++;
      setBar(done, convos.length);
      if (done % 10 === 0 || done === convos.length) {
        log(t('savedProgress', done, convos.length));
      }
      await sleep(110);   // be gentle on the API
    }

    if (!files.length) throw new Error(t('allFailed'));

    rows.sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0));
    if (wantTxt) files.unshift({ name: '_index.txt', text: indexText(rows, P.label) });
    if (wantMd) files.unshift({ name: '_index.md', text: indexMarkdown(rows, P.label) });
    if (failures.length) {
      files.push({ name: '_errors.txt', text: failures.join('\n') + '\n' });
      log(t('someFailed', failures.length), 'err');
    }

    log(t('packaging', files.length));
    const blob = makeZip(files);
    const name = P.label + ' backup ' + stamp(new Date()) + '.zip';
    const url = URL.createObjectURL(blob);
    try {
      await chrome.downloads.download({ url: url, filename: safeName(name, 120), saveAs: false });
      log(t('savedZip', name, (blob.size / 1048576).toFixed(1), rows.length), 'ok');
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 120000);
    }
    log(t('done'), 'ok');
  } catch (err) {
    log(t('failed', (err && err.message ? err.message : String(err))), 'err');
    log(t('signInHint', P.origin));
  } finally {
    running = false;
    $('go').textContent = t('startBackup');
    syncButton();
  }
}

window.addEventListener('beforeunload', (e) => {
  if (running) { e.preventDefault(); e.returnValue = ''; }
});

const NO_BULK = {
  gemini: ['Gemini', 'nbGemini'], grok: ['Grok', 'nbGrok'],
  deepseek: ['DeepSeek', 'nbDeepseek'], copilot: ['Copilot', 'nbCopilot'],
  mistral: ['Le Chat', 'nbMistral']
};

let cameFrom = null;

// Re-render in place so switching language needs no reload and leaves a run
// in progress alone.
function render() {
  applyI18n(document);
  $('note').textContent = t('oneAtATimeNote', t('exportChat'));
  $('go').textContent = running ? t('backingUp') : t('startBackup');
  syncButton();
  $('banner').textContent = cameFrom
    ? t('bannerFrom', NO_BULK[cameFrom][0], t(NO_BULK[cameFrom][1]))
    : '';
}

// Same as the popup: an impossible action is disabled, not clickable and then
// refused.
function syncButton() {
  if (!running) $('go').disabled = !$('fmt-md').checked && !$('fmt-txt').checked;
}

document.addEventListener('DOMContentLoaded', () => {
  $('go').addEventListener('click', run);
  $('fmt-md').addEventListener('change', syncButton);
  $('fmt-txt').addEventListener('change', syncButton);
  applyFormats();
  for (const id of ['fmt-md', 'fmt-txt']) {
    $(id).addEventListener('change', saveFormats);
  }
  buildLangSelect($('lang'), render);
  const p = new URLSearchParams(location.search).get('platform');
  if (p && PLATFORMS[p]) {
    const el = document.querySelector('input[name=plat][value="' + p + '"]');
    if (el) el.checked = true;
  } else if (p && NO_BULK[p]) {
    // Came from a site with no bulk endpoint. Say so rather than quietly
    // defaulting to Claude.
    cameFrom = p;
  }
  render();
});
