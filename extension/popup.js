/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Lavelle Hatcher Jr */
/* Popup controller, plus the harvester that runs inside the chat page. */

'use strict';

/* ============================================================================
   PART 1: INJECTED HARVESTER
   executeScript stringifies this whole function, so every helper it calls has
   to live inside it. Nothing from module scope is in reach.
   ========================================================================== */
async function pageHarvester(opts) {
  const MAX_MS = opts.maxMs || 180000;
  const QUIET_MS = opts.quietMs || 3500;   // how long the page must sit still
  const STEP_MS = opts.stepMs || 420;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  // i18n.js is out of reach in here, so the popup passes strings in already
  // translated and S() only fills placeholders. Defaults are English so a
  // missing key shows readable text instead of "noMessages".
  const S_EN = {
    askingSite: 'Asking the site for the full transcript…',
    apiUnavailable: 'API unavailable — falling back to scrolling the page…',
    scrollingConv: 'Scrolling the conversation ({0} visible)…',
    virtualised: 'Virtualised list — sweeping in smaller steps…',
    sweeping: 'Sweeping… {0} messages so far ({1}s)',
    noMessages: 'No messages could be read.',
    noMessagesHelp: 'Open a conversation (not the home or history screen), make sure you are signed in, then try again.'
  };
  const S = function (key) {
    const raw = (opts.s && opts.s[key]) || S_EN[key] || key;
    const args = Array.prototype.slice.call(arguments, 1);
    return String(raw).replace(/\{(\d+)\}/g, (m, i) => (args[i] !== undefined ? args[i] : m));
  };
  const say = (text) => {
    setOverlay(text);
    try {
      const p = chrome.runtime.sendMessage({ __tesserae: true, text: text });
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* popup closed; overlay still shows it */ }
  };

  /* ---------- on-page progress overlay ---------- */
  const OVERLAY_ID = '__tesserae_archiver_overlay__';
  function setOverlay(text) {
    let box = document.getElementById(OVERLAY_ID);
    if (!box) {
      box = document.createElement('div');
      box.id = OVERLAY_ID;
      box.setAttribute('style', [
        'position:fixed', 'z-index:2147483647', 'top:14px', 'right:14px',
        'max-width:320px', 'padding:10px 14px', 'border-radius:10px',
        'background:rgba(20,22,26,.94)', 'color:#f2f4f7',
        'font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
        'box-shadow:0 6px 24px rgba(0,0,0,.35)', 'pointer-events:none',
        'white-space:pre-wrap'
      ].join(';'));
      document.body.appendChild(box);
    }
    box.textContent = 'Tesserae Chat Archiver\n' + text;
  }
  function killOverlay() {
    const b = document.getElementById(OVERLAY_ID);
    if (b && b.parentNode) b.parentNode.removeChild(b);
  }

  /* ---------- small utils ---------- */
  function classNameOf(el) {
    const c = el.className;
    return typeof c === 'string' ? c : (el.getAttribute && el.getAttribute('class')) || '';
  }
  function hashOf(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36) + ':' + s.length;
  }

  /* ---------- HTML -> Markdown ---------- */
  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'BUTTON', 'SVG', 'CANVAS', 'VIDEO', 'AUDIO',
    'IFRAME', 'FORM', 'SELECT', 'TEXTAREA', 'INPUT', 'TEMPLATE', 'LINK', 'META'
  ]);
  const BLOCK_TAGS = new Set([
    'DIV', 'SECTION', 'ARTICLE', 'MAIN', 'HEADER', 'FOOTER', 'ASIDE', 'FIGURE',
    'FIGCAPTION', 'DL', 'DT', 'DD', 'ADDRESS', 'DETAILS', 'SUMMARY'
  ]);

  function isSkippable(el) {
    const tag = (el.tagName || '').toUpperCase();
    if (SKIP_TAGS.has(tag)) return true;
    if (el.getAttribute && el.getAttribute('aria-hidden') === 'true') return true;
    const cls = classNameOf(el);
    if (/(^|\s)sr-only(\s|$)/.test(cls)) return true;
    if (/(^|\s)visually-hidden(\s|$)/.test(cls)) return true;
    return false;
  }

  // CodeMirror puts each line in its own div, so textContent runs them all
  // together. Rebuild the newlines by hand.
  function codeTextOf(el) {
    const lines = el.querySelectorAll('.cm-line');
    if (lines.length) return Array.from(lines).map((l) => l.textContent).join('\n');
    return el.textContent || '';
  }

  function fenceFor(text) {
    let longest = 0, run = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '`') { run++; if (run > longest) longest = run; }
      else run = 0;
    }
    return '`'.repeat(Math.max(3, longest + 1));
  }

  function langOf(el) {
    const probes = [el, el.parentElement, el.querySelector && el.querySelector('code')];
    for (const p of probes) {
      if (!p || !p.getAttribute) continue;
      const m = classNameOf(p).match(/(?:language|lang|highlight)-([\w+#.-]+)/i);
      if (m) return m[1].toLowerCase();
      const d = p.getAttribute('data-language') || p.getAttribute('data-lang');
      if (d) return String(d).toLowerCase();
    }
    return '';
  }

  function renderCode(el) {
    const codeEl = el.querySelector && el.querySelector('code');
    const src = codeEl || el;
    const text = codeTextOf(src).replace(/\s+$/, '');
    if (!text.trim()) return '';
    const fence = fenceFor(text);
    return '\n\n' + fence + langOf(el) + '\n' + text + '\n' + fence + '\n\n';
  }

  function renderList(el, ctx) {
    const ordered = (el.tagName || '').toUpperCase() === 'OL';
    let n = parseInt(el.getAttribute('start') || '1', 10);
    if (!isFinite(n)) n = 1;
    const indent = '  '.repeat(ctx.depth);
    const lines = [];
    for (const li of Array.from(el.children)) {
      if ((li.tagName || '').toUpperCase() !== 'LI') continue;
      if (isSkippable(li)) continue;
      const inner = kids(li, Object.assign({}, ctx, { depth: ctx.depth + 1 }))
        .replace(/\n{3,}/g, '\n\n').trim();
      const marker = ordered ? (n++) + '. ' : '- ';
      const pad = ' '.repeat(marker.length);
      const parts = inner.split('\n');
      // A blank line before a nested list makes it loose. Drop it.
      for (let i = parts.length - 2; i >= 0; i--) {
        if (!parts[i].trim() && /^\s+([-*+]|\d+\.)\s/.test(parts[i + 1] || '')) parts.splice(i, 1);
      }
      lines.push(indent + marker + (parts.shift() || ''));
      for (const r of parts) {
        if (!r.trim()) { lines.push(''); continue; }
        // Already indented means it came from a nested list. Leave it.
        lines.push(/^\s/.test(r) ? r : indent + pad + r);
      }
    }
    if (!lines.length) return '';
    return '\n\n' + lines.join('\n') + '\n\n';
  }

  function renderTable(el, ctx) {
    const rows = Array.from(el.querySelectorAll('tr'));
    if (!rows.length) return '';
    const cellCtx = Object.assign({}, ctx, { depth: 0 });
    const grid = rows.map((tr) =>
      Array.from(tr.children)
        .filter((c) => /^(TD|TH)$/.test((c.tagName || '').toUpperCase()))
        .map((c) => kids(c, cellCtx).replace(/\s*\n\s*/g, ' ').replace(/\|/g, '\\|').trim())
    ).filter((r) => r.length);
    if (!grid.length) return '';
    const width = Math.max.apply(null, grid.map((r) => r.length));
    const norm = grid.map((r) => { const c = r.slice(); while (c.length < width) c.push(''); return c; });
    const hasHead = !!rows[0].querySelector('th');
    const head = hasHead ? norm[0] : new Array(width).fill('');
    const body = hasHead ? norm.slice(1) : norm;
    const out = [
      '| ' + head.join(' | ') + ' |',
      '| ' + new Array(width).fill('---').join(' | ') + ' |'
    ];
    for (const r of body) out.push('| ' + r.join(' | ') + ' |');
    return '\n\n' + out.join('\n') + '\n\n';
  }

  function textNode(node, ctx) {
    const raw = node.nodeValue || '';
    if (ctx.preserveWs) return raw;
    return raw.replace(/\s+/g, ' ');
  }

  function kids(el, ctx) {
    let s = '';
    const list = Array.from(el.childNodes);
    for (let i = 0; i < list.length; i++) s += mdOfNode(list[i], ctx);
    return s;
  }

  function mdOfNode(node, ctx) {
    if (node.nodeType === 3) return textNode(node, ctx);
    if (node.nodeType !== 1) return '';
    const el = node;
    if (isSkippable(el)) return '';

    const tag = (el.tagName || '').toUpperCase();
    const cls = classNameOf(el);

    // CodeMirror editors come through as plain divs. Treat as code.
    if (/(^|\s)cm-(editor|content)(\s|$)/.test(cls)) return renderCode(el);

    let c = ctx;
    if (tag === 'PRE' || /whitespace-pre/.test(cls)) {
      c = Object.assign({}, ctx, { preserveWs: true });
    }

    switch (tag) {
      case 'BR': return '  \n';
      case 'HR': return '\n\n---\n\n';
      case 'PRE': return renderCode(el);
      case 'UL': case 'OL': return renderList(el, ctx);
      case 'TABLE': return renderTable(el, ctx);
      case 'H1': case 'H2': case 'H3': case 'H4': case 'H5': case 'H6': {
        const t = kids(el, c).replace(/\s+/g, ' ').trim();
        // Message headings are h2, so page headings start at h3.
        return t ? '\n\n' + '#'.repeat(Math.min(6, Number(tag[1]) + 2)) + ' ' + t + '\n\n' : '';
      }
      case 'STRONG': case 'B': {
        const t = kids(el, c).trim();
        return t ? '**' + t + '**' : '';
      }
      case 'EM': case 'I': {
        const t = kids(el, c).trim();
        return t ? '*' + t + '*' : '';
      }
      case 'DEL': case 'S': case 'STRIKE': {
        const t = kids(el, c).trim();
        return t ? '~~' + t + '~~' : '';
      }
      case 'CODE': {
        if (ctx.preserveWs) return codeTextOf(el);
        const t = codeTextOf(el);
        if (!t.trim()) return '';
        if (t.indexOf('\n') !== -1) return renderCode(el);
        const tick = '`'.repeat(Math.max(1, fenceFor(t).length - 2));
        return tick + t + tick;
      }
      case 'A': {
        const t = kids(el, c).replace(/\s+/g, ' ').trim();
        if (!t) return '';
        const href = el.getAttribute('href') || '';
        if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0) return t;
        return '[' + t + '](' + href + ')';
      }
      case 'IMG': {
        const src = el.getAttribute('src') || '';
        const alt = (el.getAttribute('alt') || 'image').replace(/[\[\]]/g, '');
        if (!src || src.indexOf('data:') === 0) return alt ? '[' + alt + ']' : '';
        return '![' + alt + '](' + src + ')';
      }
      case 'BLOCKQUOTE': {
        const inner = kids(el, c).replace(/\n{3,}/g, '\n\n').trim();
        if (!inner) return '';
        return '\n\n' + inner.split('\n').map((l) => (l.trim() ? '> ' + l : '>')).join('\n') + '\n\n';
      }
      case 'P': case 'LI': {
        const t = kids(el, c);
        return t.trim() ? '\n\n' + t.trim() + '\n\n' : '';
      }
      default: {
        const t = kids(el, c);
        if (!t) return '';
        return BLOCK_TAGS.has(tag) ? '\n\n' + t + '\n\n' : t;
      }
    }
  }

  function toMarkdown(root) {
    if (!root) return '';
    // Check the root's own white-space too: ChatGPT user turns are one
    // whitespace-pre-wrap div holding raw newlines.
    const rootTag = (root.tagName || '').toUpperCase();
    const rootPre = rootTag === 'PRE' || /whitespace-pre/.test(classNameOf(root));
    const raw = kids(root, { depth: 0, preserveWs: rootPre });
    return raw
      .split('\n').map((l) => l.replace(/[ \t]+$/, (m) => (m === '  ' ? '  ' : '')))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /* ---------- site adapters ----------
     Every adapter lists fallbacks. These sites reskin often and one renamed
     class should not take the export down with it. */
  const ADAPTERS = {
    claude: {
      name: 'Claude',
      turns: '[data-testid="user-message"], [data-testid="assistant-message"], div.font-claude-response, div.font-claude-message',
      roleOf: function (el) {
        return el.matches('[data-testid="user-message"]') ? 'user' : 'assistant';
      },
      contentOf: function (el) { return el; }
    },
    chatgpt: {
      name: 'ChatGPT',
      turns: '[data-message-author-role]',
      roleOf: function (el) {
        const r = (el.getAttribute('data-message-author-role') || '').toLowerCase();
        return r === 'user' ? 'user' : r === 'assistant' ? 'assistant' : (r || 'assistant');
      },
      contentOf: function (el) {
        return el.querySelector(':scope .markdown, :scope .whitespace-pre-wrap') || el;
      }
    },
    gemini: {
      name: 'Gemini',
      turns: 'user-query, model-response',
      // Gemini keeps its history in a custom <infinite-scroller> tag, which a
      // div/main/section scan never finds.
      scroller: '#chat-history > infinite-scroller, infinite-scroller, #chat-history',
      // It appends turns instead of recycling them, and only fetches older
      // ones while the scroller sits at the very top.
      scrollMode: 'top',
      roleOf: function (el) {
        return (el.tagName || '').toLowerCase() === 'user-query' ? 'user' : 'assistant';
      },
      contentOf: function (el) {
        // Preference order. A comma-joined querySelector gives document order
        // instead, which hands back the wrapper, not the panel.
        return el.querySelector('div.markdown.markdown-main-panel')
            || el.querySelector('message-content')
            || el.querySelector('div.query-text')
            || el.querySelector('div.response-content')
            || el;
      }
    },
    grok: {
      name: 'Grok',
      // grok.com dropped CSS-in-JS for Tailwind, so the old css-xxxxxxx
      // selectors match nothing now.
      turns: '.message-bubble, [data-testid="message-bubble"]',
      roleOf: function (el, i) {
        if (el.querySelector('.response-content-markdown')) return 'assistant';
        const cls = classNameOf(el) + ' ' + classNameOf(el.parentElement || el);
        if (/\bbg-surface-l1\b/.test(cls)) return 'assistant';
        if (/\b(ml-auto|justify-end|items-end|self-end)\b/.test(cls)) return 'user';
        return i % 2 === 0 ? 'user' : 'assistant';
      },
      contentOf: function (el) {
        return el.querySelector('.response-content-markdown') || el;
      }
    },
    deepseek: {
      name: 'DeepSeek',
      // ds-markdown is the only stable hook here. The rest of DeepSeek's
      // class names are build hashes, so user turns fall through to the
      // structural detector below.
      turns: 'div.ds-markdown, [class*="ds-markdown"]',
      roleOf: function () { return 'assistant'; },
      contentOf: function (el) { return el; }
    },
    copilot: {
      name: 'Copilot',
      turns: '[data-content="user-message"], [data-content="ai-message"]',
      roleOf: function (el) {
        return el.getAttribute('data-content') === 'user-message' ? 'user' : 'assistant';
      },
      contentOf: function (el) { return el; }
    },
    generic: {
      name: 'this page',
      turns: '[data-message-author-role], [data-testid="user-message"], [data-testid="assistant-message"], div.font-claude-response, user-query, model-response, [data-testid^="conversation-turn-"]',
      roleOf: function (el) {
        const own = (el.getAttribute('data-message-author-role') || '').toLowerCase();
        if (own) return own === 'user' ? 'user' : 'assistant';
        // A turn wrapper can outrank its own message div in the de-dupe, so
        // look inside it before settling the role.
        const inner = el.querySelector && el.querySelector('[data-message-author-role]');
        if (inner) {
          const r = (inner.getAttribute('data-message-author-role') || '').toLowerCase();
          if (r) return r === 'user' ? 'user' : 'assistant';
        }
        if (el.matches('[data-testid="user-message"], user-query')) return 'user';
        if (el.querySelector && el.querySelector('[data-testid="user-message"], user-query')) return 'user';
        // Screen-reader text ("You said:") is the last honest signal.
        const sr = el.querySelector && el.querySelector('.sr-only, h5, h6');
        if (sr && /^\s*you\b/i.test(sr.textContent || '')) return 'user';
        return 'assistant';
      },
      contentOf: function (el) {
        const inner = (el.querySelector && el.querySelector('[data-message-author-role]')) || el;
        return inner.querySelector(':scope .markdown, :scope .whitespace-pre-wrap') || inner;
      }
    }
  };

  function pickAdapter() {
    const h = location.hostname;
    let key = 'generic';
    if (/(^|\.)claude\.ai$/.test(h)) key = 'claude';
    else if (/(^|\.)chatgpt\.com$/.test(h) || /(^|\.)openai\.com$/.test(h)) key = 'chatgpt';
    else if (/(^|\.)gemini\.google\.com$/.test(h)) key = 'gemini';
    else if (/(^|\.)grok\.com$/.test(h) || /(^|\.)x\.com$/.test(h)) key = 'grok';
    else if (/(^|\.)deepseek\.com$/.test(h)) key = 'deepseek';
    else if (/(^|\.)copilot\.microsoft\.com$/.test(h) || /(^|\.)bing\.com$/.test(h)) key = 'copilot';
    // Nothing from the site adapter, so try the union of all of them.
    if (key !== 'generic' && !document.querySelector(ADAPTERS[key].turns)) {
      if (document.querySelector(ADAPTERS.generic.turns)) return ADAPTERS.generic;
    }
    return ADAPTERS[key];
  }

  /* ---------- structural detector ----------
     For markup that gives us nothing to hold onto. DeepSeek rotates its class
     names every deploy, Le Chat ships no hooks at all, Grok broke once already
     coming off CSS-in-JS. Chasing that is a losing game, so find the thread by
     shape instead: the container holding the most substantial sibling text
     blocks. Roles come from attributes, then bubble alignment, then
     alternation. */

  const ROLE_USER = /(^|[^a-z])(user|human|you|me|prompt|question|query|request|sent)([^a-z]|$)/i;
  const ROLE_BOT = /(^|[^a-z])(assistant|ai|bot|model|response|answer|reply|agent|completion|received)([^a-z]|$)/i;

  function roleHint(el) {
    const bits = [];
    for (const a of ['data-message-author-role', 'data-content', 'data-testid',
                     'data-role', 'data-author', 'aria-label', 'role', 'id']) {
      const v = el.getAttribute && el.getAttribute(a);
      if (v) bits.push(v);
    }
    bits.push(classNameOf(el));
    const hay = bits.join(' ');
    if (!hay.trim()) return null;
    const u = ROLE_USER.test(hay), b = ROLE_BOT.test(hay);
    if (u && !b) return 'user';
    if (b && !u) return 'assistant';
    return null;
  }

  // Chat UIs almost always right-align the human's bubble.
  function looksRightAligned(el) {
    const cls = classNameOf(el) + ' ' + classNameOf(el.firstElementChild || el);
    if (/(^|\s)(ml-auto|justify-end|items-end|self-end|text-right)(\s|$)/.test(cls)) return true;
    try {
      const r = el.getBoundingClientRect();
      const p = el.parentElement && el.parentElement.getBoundingClientRect();
      if (!p || !r.width || !p.width) return false;
      if (r.width > p.width * 0.92) return false;       // full-width: not a bubble
      const left = r.left - p.left, right = p.right - r.right;
      return left > right * 1.6 && left > 24;
    } catch (e) { return false; }
  }

  function detectStructural() {
    const MIN_TEXT = 24, MAX_NODES = 9000;
    const groups = new Map();
    let n = 0;
    for (const el of document.body.querySelectorAll('*')) {
      if (++n > MAX_NODES) break;
      if (isSkippable(el)) continue;
      const parent = el.parentElement;
      if (!parent || parent === document.body) continue;
      const len = (el.textContent || '').trim().length;
      if (len < MIN_TEXT) continue;
      let g = groups.get(parent);
      if (!g) { g = []; groups.set(parent, g); }
      if (g.length < 400) g.push(el);
    }

    let best = null, bestScore = 0;
    groups.forEach((kids, parent) => {
      if (kids.length < 2) return;
      // Real turns are siblings of similar weight, so score on count and on
      // total text. Stops one fat wrapper outscoring the list inside it.
      let total = 0;
      for (const k of kids) total += (k.textContent || '').trim().length;
      const score = total * Math.min(kids.length, 60);
      if (score > bestScore) { bestScore = score; best = { parent: parent, kids: kids }; }
    });
    if (!best) return null;

    const kids = best.kids.filter((k) => !best.kids.some((m) => m !== k && m.contains(k)));
    if (kids.length < 2) return null;
    note('structural detector: ' + kids.length + ' blocks under <' +
         (best.parent.tagName || '?').toLowerCase() + '>');

    // Anchor the alternation on a turn we are sure about.
    let anchorIdx = -1, anchorRole = null;
    for (let i = 0; i < kids.length; i++) {
      const h = roleHint(kids[i]);
      if (h) { anchorIdx = i; anchorRole = h; break; }
    }
    if (anchorIdx === -1) {
      for (let i = 0; i < kids.length; i++) {
        if (looksRightAligned(kids[i])) { anchorIdx = i; anchorRole = 'user'; break; }
      }
    }
    note(anchorIdx === -1
      ? 'no role markers found; assuming the conversation opens with you'
      : 'role anchored at turn ' + anchorIdx + ' = ' + anchorRole);

    return {
      name: 'this page',
      getNodes: function () { return kids; },
      roleOf: function (el, i) {
        const h = roleHint(el);
        if (h) return h;
        if (looksRightAligned(el)) return 'user';
        if (anchorIdx >= 0) {
          return ((i - anchorIdx) % 2 === 0) ? anchorRole
               : (anchorRole === 'user' ? 'assistant' : 'user');
        }
        return i % 2 === 0 ? 'user' : 'assistant';
      },
      contentOf: function (el) { return el; }
    };
  }

  /* ---------- turn collection ---------- */
  function collectTurns(ad) {
    let nodes;
    if (typeof ad.getNodes === 'function') {
      try { nodes = ad.getNodes() || []; } catch (e) { return []; }
    } else {
      try { nodes = Array.from(document.querySelectorAll(ad.turns)); }
      catch (e) { return []; }
    }
    // Drop matches nested inside other matches so nothing counts twice.
    const top = nodes.filter((n) => !nodes.some((m) => m !== n && m.contains(n)));
    const out = [];
    for (let i = 0; i < top.length; i++) {
      const n = top[i];
      let role, md;
      try { role = ad.roleOf(n, i, top); md = toMarkdown(ad.contentOf(n)); }
      catch (e) { continue; }
      if (!md) continue;
      out.push({ role: role, md: md, key: role + '|' + hashOf(md) });
    }
    return out;
  }

  /* ---------- merge overlapping harvest windows ----------
     Only needed when the page recycles message nodes. Each window is a
     contiguous slice caught on the way up, so it overlaps the head of what we
     already have. */
  function mergeWindows(windows) {
    if (!windows.length) return [];
    let result = windows[0].slice();
    for (let w = 1; w < windows.length; w++) {
      const win = windows[w];
      if (!win.length) continue;
      let overlap = 0;
      const max = Math.min(win.length, result.length);
      for (let len = max; len > 0; len--) {
        let ok = true;
        for (let i = 0; i < len; i++) {
          if (win[win.length - len + i].key !== result[i].key) { ok = false; break; }
        }
        if (ok) { overlap = len; break; }
      }
      if (overlap > 0) {
        result = win.slice(0, win.length - overlap).concat(result);
      } else {
        const have = new Set(result.map((m) => m.key));
        const add = win.filter((m) => !have.has(m.key));
        result = add.concat(result);
      }
    }
    return result;
  }

  /* ---------- title ---------- */
  function deriveTitle(messages) {
    let t = (document.title || '').trim();
    t = t.replace(/\s*[-–—|]\s*(Claude|ChatGPT|Gemini)\s*$/i, '')
         .replace(/^\s*(ChatGPT|Claude|Gemini)\s*[-–—|]\s*/i, '')
         .trim();
    if (!t || /^(chatgpt|claude|gemini|new chat|untitled)$/i.test(t)) t = '';
    if (!t) {
      const first = messages.find((m) => m.role === 'user');
      if (first) t = first.md.replace(/[#*`>\[\]]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
    }
    return t || 'conversation';
  }

  /* ==================== API HARVESTERS (preferred) ====================
     claude.ai virtualises the message list, so off-screen turns are unmounted
     rather than hidden and no amount of scrolling gets a long thread into the
     DOM at once. The page's own conversation endpoint returns all of it in one
     response, already as the markdown the model wrote, on the session cookies
     that are right there. */

  const diag = [];
  const note = (s) => { diag.push(s); return s; };

  async function getJson(url, headers) {
    const res = await fetch(url, {
      credentials: 'include',
      headers: Object.assign({ 'accept': 'application/json' }, headers || {})
    });
    note(url.split('?')[0] + ' -> HTTP ' + res.status);
    if (!res.ok) throw new Error('HTTP ' + res.status + ' from ' + url.split('?')[0]);
    return res.json();
  }

  // Walk parent links back from the newest leaf so edits and regenerations
  // collapse to the one thread actually on screen.
  function pickBranch(arr, idOf, parentOf, timeOf, leafId) {
    if (arr.length < 2) return arr;
    const kids = new Map();
    for (const m of arr) {
      const p = parentOf(m);
      if (p) kids.set(p, (kids.get(p) || 0) + 1);
    }
    let branched = false;
    kids.forEach((c) => { if (c > 1) branched = true; });
    if (!branched) return arr;
    note('branching detected; following the newest branch');
    const byId = new Map(arr.map((m) => [idOf(m), m]));
    const parents = new Set(arr.map(parentOf).filter(Boolean));
    const leaves = arr.filter((m) => !parents.has(idOf(m)));
    leaves.sort((a, b) => timeOf(b) - timeOf(a));
    // The response names the active leaf outright. Trust it.
    let cur = (leafId && byId.get(leafId)) || leaves[0] || arr[arr.length - 1];
    if (leafId && byId.get(leafId)) note('branch anchored on current_leaf_message_uuid');
    const chain = [];
    const guard = new Set();
    while (cur && !guard.has(idOf(cur))) {
      guard.add(idOf(cur));
      chain.push(cur);
      cur = byId.get(parentOf(cur));
    }
    chain.reverse();
    return chain.length >= 2 ? chain : arr;
  }

  // Everything pickBranch threw away. For each message on the exported chain,
  // any child that is not the next link is the head of a branch someone edited
  // or regenerated away; follow each one down to its own newest leaf.
  // Opt-in, so this never runs unless the box is ticked.
  function collectBranches(all, idOf, parentOf, timeOf, chain, toMsg) {
    if (all.length === chain.length) return [];
    const onChain = new Set(chain.map(idOf));
    const kids = new Map();
    for (const m of all) {
      const p = parentOf(m);
      if (!p) continue;
      if (!kids.has(p)) kids.set(p, []);
      kids.get(p).push(m);
    }
    const out = [];
    let from = null;          // last chain node that produced a real message
    for (const parent of chain) {
      const asMsg = toMsg(parent);
      if (asMsg && asMsg.md) from = asMsg;
      const forks = (kids.get(idOf(parent)) || []).filter((k) => !onChain.has(idOf(k)));
      if (!forks.length) continue;
      forks.sort((a, b) => timeOf(a) - timeOf(b));
      for (const head of forks) {
        const run = [];
        const guard = new Set();
        let cur = head;
        while (cur && !guard.has(idOf(cur))) {
          guard.add(idOf(cur));
          run.push(cur);
          // A branch can itself have been branched; stay on its newest line.
          cur = (kids.get(idOf(cur)) || []).slice()
                  .sort((a, b) => timeOf(b) - timeOf(a))[0];
        }
        const messages = run.map(toMsg).filter((m) => m && m.md);
        if (!messages.length) continue;
        out.push({
          fromRole: from ? from.role : '',
          fromText: from && from.md ? excerpt(from.md) : '',
          messages: messages
        });
      }
    }
    if (out.length) note('collected ' + out.length + ' abandoned branch(es)');
    return out;
  }

  function excerpt(md) {
    const flat = md.replace(/`{3,}[\s\S]*?`{3,}/g, ' [code] ')
                   .replace(/\s+/g, ' ').trim();
    return flat.length > 72 ? flat.slice(0, 72).trimEnd() + '\u2026' : flat;
  }

  // Undocumented shape, so probe every plausible spelling of the project
  // reference instead of betting on one. Absent means omit it, never guess.
  function projectRefOf(j) {
    const p = j.project || j.chat_project || j.project_metadata;
    if (p && typeof p === 'object') {
      return { id: String(p.uuid || p.id || ''), name: String(p.name || p.title || '').trim() };
    }
    const id = j.project_uuid || j.project_id || j.projectUuid || j.projectId;
    return id ? { id: String(id), name: '' } : null;
  }

  async function claudeProjects(org) {
    const map = new Map();
    for (const url of ['/api/organizations/' + org + '/projects?limit=100',
                       '/api/organizations/' + org + '/projects']) {
      try {
        let j = await getJson(url);
        if (!Array.isArray(j)) j = j.items || j.data || j.projects || [];
        for (const pr of j) {
          const id = pr && (pr.uuid || pr.id);
          const nm = pr && (pr.name || pr.title);
          if (id && nm) map.set(String(id), String(nm).trim());
        }
        if (map.size) { note('projects resolved: ' + map.size); return map; }
      } catch (e) { /* endpoint absent or renamed; carry on without names */ }
    }
    note('no projects endpoint responded');
    return map;
  }

  function claudeText(m) {
    const parts = [];
    if (Array.isArray(m.content)) {
      for (const b of m.content) {
        if (!b || typeof b !== 'object') continue;
        if (b.type === 'text' && typeof b.text === 'string') parts.push(b.text);
        else if (b.type === 'thinking' && typeof b.thinking === 'string' && b.thinking.trim()) {
          parts.push('<details><summary>Thinking</summary>\n\n' + b.thinking.trim() + '\n\n</details>');
        } else if (b.type === 'tool_use' && b.name) {
          parts.push('`[tool: ' + b.name + ']`');
        }
      }
    }
    let out = parts.join('\n\n').trim();
    if (!out && typeof m.text === 'string') out = m.text.trim();
    const files = []
      .concat(m.attachments || [], m.files || [])
      .map((f) => f && (f.file_name || f.name || f.filename))
      .filter(Boolean);
    if (files.length) out += (out ? '\n\n' : '') + '*Attached: ' + files.join(', ') + '*';
    return out.trim();
  }

  async function claudeApi() {
    const share = location.pathname.match(/\/share\/([0-9a-f-]{36})/i);
    if (share) {
      const j = await getJson('/api/chat_snapshots/' + share[1]);
      return await shapeClaude(j, null);
    }
    const m = location.pathname.match(/\/chat\/([0-9a-f-]{36})/i);
    if (!m) { note('URL is not a /chat/<uuid> page'); return null; }
    const convId = m[1];

    let orgs = await getJson('/api/organizations');
    if (!Array.isArray(orgs)) orgs = orgs.organizations || [];
    const ids = orgs.map((o) => o && o.uuid).filter(Boolean);
    note('organizations found: ' + ids.length);
    if (!ids.length) throw new Error('No organization returned. Are you signed in?');

    const qs = '?tree=True&rendering_mode=messages&render_all_tools=true';
    let lastErr = null;
    // Team and Enterprise accounts can hold several orgs. Try each.
    for (const org of ids) {
      try {
        const j = await getJson('/api/organizations/' + org + '/chat_conversations/' + convId + qs);
        return await shapeClaude(j, org);
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Conversation not found in any organization');
  }

  async function shapeClaude(j, org) {
    const raw = j.chat_messages || j.messages ||
                (j.chat_conversation && j.chat_conversation.chat_messages) || [];
    if (!raw.length) throw new Error('API returned no messages');
    note('API returned ' + raw.length + ' raw messages');

    let project = '';
    const ref = projectRefOf(j);
    if (ref) {
      project = ref.name;
      if (!project && ref.id && org) {
        const map = await claudeProjects(org);
        project = map.get(ref.id) || '';
      }
      note('project: ' + (project || '(id ' + ref.id + ', name unresolved)'));
    } else note('conversation carries no project reference');

    const t = (m) => new Date(m.created_at || 0).getTime() || 0;
    const idOf = (m) => m.uuid;
    const parentOf = (m) => m.parent_message_uuid;
    const toMsg = (m) => ({
      role: (m.sender === 'human' || m.sender === 'user') ? 'user' : 'assistant',
      md: claudeText(m),
      at: m.created_at || ''
    });
    const branch = pickBranch(raw, idOf, parentOf, t, j.current_leaf_message_uuid);
    const messages = branch.map(toMsg).filter((m) => m.md);
    return {
      messages: messages,
      branches: opts.branches
        ? collectBranches(raw, idOf, parentOf, t, branch, toMsg) : [],
      title: (j.name || j.title || '').trim(),
      project: project,
      model: (j.model || '').trim(),
      platform: 'Claude'
    };
  }

  function chatgptText(msg) {
    const c = msg.content || {};
    const strs = (c.parts || []).filter((p) => typeof p === 'string');
    if (c.content_type === 'code') {
      return '```' + (c.language && c.language !== 'unknown' ? c.language : '') +
             '\n' + (c.text || strs.join('\n')) + '\n```';
    }
    if (strs.length) return strs.join('\n\n');
    if (typeof c.text === 'string') return c.text;
    return '';
  }

  async function chatgptApi() {
    const m = location.pathname.match(/\/(?:c|share)\/([0-9a-zA-Z-]{20,})/);
    if (!m) { note('URL is not a /c/<id> page'); return null; }
    const sess = await getJson('/api/auth/session');
    const tok = sess && sess.accessToken;
    if (!tok) throw new Error('No access token. Sign in to ChatGPT first.');
    note('session token acquired');
    const j = await getJson('/backend-api/conversation/' + m[1],
      { authorization: 'Bearer ' + tok });

    const map = j.mapping || {};
    const chain = [];
    const seen = new Set();
    let id = j.current_node;
    while (id && map[id] && !seen.has(id)) {
      seen.add(id);
      chain.push(map[id]);
      id = map[id].parent;
    }
    chain.reverse();
    note('walked ' + chain.length + ' nodes from current_node');

    // Nodes carry wrappers and hidden system turns, so a node maps to a message
    // only sometimes. Returning null keeps the filters below honest.
    const toMsg = (node) => {
      const msg = node && node.message;
      if (!msg || !msg.author) return null;
      const role = msg.author.role;
      if (role !== 'user' && role !== 'assistant') return null;
      if ((msg.metadata || {}).is_visually_hidden_from_conversation) return null;
      const md = chatgptText(msg).trim();
      if (!md) return null;
      return {
        role: role,
        md: md,
        at: msg.create_time ? new Date(msg.create_time * 1000).toISOString() : ''
      };
    };
    const messages = chain.map(toMsg).filter(Boolean);
    if (!messages.length) throw new Error('API returned no readable messages');

    let branches = [];
    if (opts.branches) {
      const t = (n) => (n.message && n.message.create_time) || 0;
      branches = collectBranches(Object.keys(map).map((k) => map[k]),
                                 (n) => n.id, (n) => n.parent, t, chain, toMsg);
    }
    return {
      messages: messages,
      branches: branches,
      title: (j.title || '').trim(),
      platform: 'ChatGPT'
    };
  }

  /* ==================== DOM SWEEP (fallback) ==================== */

  function scrollerCandidates(sample, ad) {
    const out = [];
    // An adapter's declared container wins outright.
    if (ad && ad.scroller) {
      // One selector at a time. Comma-joined gives document order, which puts
      // an outer non-scrolling wrapper ahead of the real scroller.
      for (const sel of ad.scroller.split(',')) {
        for (const el of document.querySelectorAll(sel.trim())) {
          if (out.indexOf(el) === -1) out.push(el);
        }
      }
      // Hints that can actually scroll right now go first.
      out.sort((a, b) => {
        const sa = a.scrollHeight > a.clientHeight + 40 ? 0 : 1;
        const sb = b.scrollHeight > b.clientHeight + 40 ? 0 : 1;
        return sa - sb;
      });
      if (out.length) note('adapter scroller matched: ' + out.length +
        ' (using <' + (out[0].tagName || '?').toLowerCase() + '>)');
    }
    let cur = sample;
    while (cur && cur !== document.body && cur !== document.documentElement) {
      let cs = null;
      try { cs = getComputedStyle(cur); } catch (e) {}
      if (cs && /(auto|scroll|overlay)/.test(cs.overflowY) && cur.scrollHeight > cur.clientHeight + 40) out.push(cur);
      cur = cur.parentElement;
    }
    // Ancestors, deepest scrollable distance first. That is the thread pane.
    const hinted = (ad && ad.scroller) ? out.length : 0;
    const rest = out.slice(hinted);
    rest.sort((a, b) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight));
    out.length = hinted;
    for (const r of rest) out.push(r);

    // Every element, not just div/main/section: Gemini's scroller is a custom
    // tag. Geometry runs first so getComputedStyle, which is the expensive
    // part, only sees the few that survive it.
    let best = null, score = 0;
    for (const d of document.querySelectorAll('*')) {
      if (d.clientHeight < 200) continue;
      if (d.scrollHeight - d.clientHeight < 40) continue;
      let cs = null;
      try { cs = getComputedStyle(d); } catch (e) { continue; }
      if (!cs || !/(auto|scroll|overlay)/.test(cs.overflowY)) continue;
      const sc = d.scrollHeight - d.clientHeight;
      if (sc > score) { score = sc; best = d; }
    }
    if (best && out.indexOf(best) === -1) out.push(best);
    out.push(document.scrollingElement || document.documentElement);
    return out;
  }

  function setTop(el, v) {
    if (el === document.scrollingElement || el === document.documentElement) window.scrollTo(0, v);
    else el.scrollTop = v;
  }

  async function domSweep(ad) {
    const first = collectTurns(ad);
    if (!first.length) return null;

    const cands = scrollerCandidates(document.querySelector(ad.turns), ad);
    let scroller = cands[0];
    note('scroll candidates: ' + cands.length + ' | mode: ' + (ad.scrollMode || 'step'));

    const windows = [];
    const seenKeys = new Set();
    const push = (w) => { if (w && w.length) { windows.push(w); for (const m of w) seenKeys.add(m.key); } };
    push(first);

    // claude.ai virtualises, so keep the leaps short enough that consecutive
    // snapshots always overlap.
    let jump = /claude\.ai$/.test(location.hostname) ? 0.7 : 1.6;
    // 'top' pins the scroller to 0 on every pass, which is how Gemini's
    // infinite-scroller is made to fetch the previous page. Only safe because
    // those pages keep their turns. If we detect recycling we drop back to
    // stepping so the snapshots still overlap.
    let mode = ad.scrollMode || 'step';
    let recycling = false;
    let lastChange = Date.now();
    let rounds = 0, candIdx = 0, deadScrolls = 0;
    const startedSweep = Date.now();

    // Baseline after the first snapshot, so "produced nothing" means nothing
    // new rather than nothing at all.
    let candStartSeen = seenKeys.size;

    say(S('scrollingConv', first.length));

    while (Date.now() - startedSweep < MAX_MS) {
      rounds++;
      const beforeH = scroller.scrollHeight;
      const beforeTop = (scroller === document.scrollingElement || scroller === document.documentElement)
        ? (window.scrollY || 0) : scroller.scrollTop;
      const beforeSeen = seenKeys.size;

      setTop(scroller, mode === 'top' ? 0 : Math.max(0, beforeTop - scroller.clientHeight * jump));
      await sleep(STEP_MS);

      const afterTop = (scroller === document.scrollingElement || scroller === document.documentElement)
        ? (window.scrollY || 0) : scroller.scrollTop;

      const snap = collectTurns(ad);
      push(snap);

      if (!recycling && snap.length && snap.length < seenKeys.size) {
        recycling = true; jump = Math.min(jump, 0.7); mode = 'step';
        note('virtualised list confirmed, switching to overlapping steps');
        say(S('virtualised'));
      }

      const grewH = scroller.scrollHeight > beforeH + 4;
      const gotMore = seenKeys.size > beforeSeen;
      const movedUp = afterTop < beforeTop - 4;

      // Only call it the wrong scroller if nothing at all happened. An
      // infinite-scroller restores the same scrollTop after prepending a page,
      // so scrollTop on its own proves nothing. Growth is the signal.
      if (afterTop === beforeTop && beforeTop > 2 && !grewH && !gotMore) {
        deadScrolls++;
        if (deadScrolls >= 2 && candIdx + 1 < cands.length) {
          candIdx++; scroller = cands[candIdx]; deadScrolls = 0;
          candStartSeen = seenKeys.size; lastChange = Date.now();
          note('switched to scroll candidate #' + candIdx);
          continue;
        }
      } else deadScrolls = 0;

      if (gotMore || grewH || movedUp) lastChange = Date.now();

      const atTop = afterTop <= 2;
      // Quit on elapsed quiet time, not a round count. A month of history on
      // a slow link can take seconds per page.
      if (atTop && Date.now() - lastChange > QUIET_MS) {
        // Before giving up, check we had the right element. One that produced
        // nothing new probably is not it.
        if (seenKeys.size === candStartSeen && candIdx + 1 < cands.length) {
          candIdx++; scroller = cands[candIdx];
          candStartSeen = seenKeys.size; lastChange = Date.now(); deadScrolls = 0;
          note('no new messages from candidate #' + (candIdx - 1) + '; trying #' + candIdx);
          continue;
        }
        break;
      }

      if (rounds % 5 === 0) {
        say(S('sweeping', seenKeys.size, Math.round((Date.now() - startedSweep) / 1000)));
      }
    }

    const finalPass = collectTurns(ad);
    let messages = finalPass;
    let warning = '';
    if (seenKeys.size > finalPass.length) {
      messages = mergeWindows(windows);
      warning = 'Read from the page itself, which recycles off-screen messages; ' +
                'rebuilt from ' + windows.length + ' scroll snapshots. Spot-check the order.';
    }
    if (messages.length < seenKeys.size) {
      const merged = mergeWindows(windows);
      if (merged.length > messages.length) messages = merged;
    }
    note('DOM sweep: ' + rounds + ' rounds, ' + seenKeys.size + ' distinct, ' + messages.length + ' kept');
    return {
      messages: messages.map((m) => ({ role: m.role, md: m.md, at: '' })),
      title: '', platform: ad.name, warning: warning, rounds: rounds
    };
  }

  /* ============================ main ============================ */
  const started = Date.now();
  try {
    let ad = pickAdapter();
    const host = location.hostname;
    note('host: ' + host + ' | adapter: ' + ad.name);
    let turns0 = collectTurns(ad);
    let found = turns0.length;
    const roles0 = new Set(turns0.map((t) => t.role));
    note('turns matching now: ' + found + ' (' + Array.from(roles0).join('+') + ')');

    // Go structural when the named selectors come up empty, and also when
    // they only ever return one role, which means half the thread is invisible
    // to them. DeepSeek is that case: only its assistant turns carry a stable
    // class.
    if (found < 2 || roles0.size < 2) {
      const st = detectStructural();
      if (st) {
        const stTurns = collectTurns(st);
        const stRoles = new Set(stTurns.map((t) => t.role));
        note('structural detector found ' + stTurns.length +
             ' turns (' + Array.from(stRoles).join('+') + ')');
        if (stTurns.length > found || (stRoles.size > roles0.size && stTurns.length >= found)) {
          ad = st; found = stTurns.length;
          note('using the structural detector');
        }
      }
    }

    let result = null, source = '';

    if (opts.preferApi !== false) {
      const api = /(^|\.)claude\.ai$/.test(host) ? claudeApi
                : (/(^|\.)chatgpt\.com$/.test(host) || /(^|\.)openai\.com$/.test(host)) ? chatgptApi
                : null;
      if (api) {
        say(S('askingSite'));
        try {
          const r = await api();
          if (r && r.messages && r.messages.length) { result = r; source = 'api'; }
          else note('API path returned nothing usable');
        } catch (e) {
          note('API path failed: ' + (e && e.message ? e.message : String(e)));
          say(S('apiUnavailable'));
        }
      } else note('no API adapter for this host');
    }

    if (!result) {
      const r = await domSweep(ad);
      if (r && r.messages.length) { result = r; source = 'dom'; }
    }

    if (!result || !result.messages.length) {
      return {
        ok: false, diag: diag,
        error: S('noMessages') + ' ' + S('noMessagesHelp')
      };
    }

    const hitLimit = (Date.now() - started) >= MAX_MS;
    let warning = result.warning || '';
    if (hitLimit && source === 'dom') {
      warning = (warning ? warning + ' ' : '') +
        'Stopped at the ' + Math.round(MAX_MS / 1000) + 's limit; the oldest messages may be missing.';
    }

    return {
      ok: true,
      source: source,
      title: result.title || deriveTitle(result.messages),
      project: result.project || '',
      model: result.model || '',
      url: location.href,
      platform: result.platform || ad.name,
      messages: result.messages,
      branches: result.branches || [],
      warning: warning,
      seconds: Math.round((Date.now() - started) / 1000),
      rounds: result.rounds || 0,
      diag: diag
    };
  } catch (err) {
    return { ok: false, error: (err && err.message) ? err.message : String(err), diag: diag };
  } finally {
    killOverlay();
  }
}

/* ============================================================================
   PART 2: POPUP CONTROLLER
   ========================================================================== */
const $ = (id) => document.getElementById(id);
const logBox = $('log');

function log(text, cls) {
  const line = document.createElement('div');
  if (cls) line.className = cls;
  line.textContent = text;
  logBox.appendChild(line);
  logBox.scrollTop = logBox.scrollHeight;
}

/* Progress messages streamed from the injected script. */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.__tesserae && msg.text) log(msg.text);
});

function platformOf(url) {
  try {
    const h = new URL(url).hostname;
    if (/(^|\.)claude\.ai$/.test(h)) return 'Claude';
    if (/(^|\.)chatgpt\.com$/.test(h) || /(^|\.)openai\.com$/.test(h)) return 'ChatGPT';
    if (/(^|\.)gemini\.google\.com$/.test(h)) return 'Gemini';
    if (/(^|\.)grok\.com$/.test(h)) return 'Grok';
    if (/(^|\.)deepseek\.com$/.test(h)) return 'DeepSeek';
    if (/(^|\.)copilot\.microsoft\.com$/.test(h)) return 'Copilot';
    if (/(^|\.)mistral\.ai$/.test(h)) return 'Le Chat';
    return h;
  } catch (e) { return null; }
}

async function activeTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs && tabs[0];
}

function labelFor(role, platform) {
  if (role === 'user') return 'You';
  if (role === 'assistant') return platform || 'Assistant';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function stamp(d) {
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
         '_' + p(d.getHours()) + p(d.getMinutes());
}

function safeName(s) {
  return String(s)
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[\/\\:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^[.\s]+|[.\s]+$/g, '')
    .slice(0, 90) || 'chat';
}

function buildMarkdown(d) {
  const out = [];
  out.push('# ' + d.title, '');
  out.push('| | |');
  out.push('|---|---|');
  out.push('| **Source** | ' + d.url + ' |');
  out.push('| **Platform** | ' + d.platform + ' |');
  if (d.project) out.push('| **Project** | ' + d.project.replace(/\|/g, '\\|') + ' |');
  if (d.model) out.push('| **Model** | ' + d.model + ' |');
  out.push('| **Messages** | ' + d.messages.length + ' |');
  if (branchCount(d)) out.push('| **Branches** | ' + branchCount(d) + ' |');
  out.push('| **Exported** | ' + new Date().toISOString() + ' |');
  out.push('| **Method** | ' + (d.source === 'api'
    ? 'Site transcript API (complete)'
    : 'Page scrape with scrolling (may be partial)') + ' |');
  if (d.warning) out.push('| **Note** | ' + d.warning.replace(/\|/g, '\\|') + ' |');
  out.push('', '---', '');
  for (const m of d.messages) {
    out.push('## ' + labelFor(m.role, d.platform));
    if (m.at) out.push('', '*' + m.at + '*');
    out.push('', m.md, '', '---', '');
  }
  // Branch headings stay at level 2 like every other message, so the heading
  // demotion in the harvester still holds and nothing inside a message can
  // outrank its own title.
  if (branchCount(d)) {
    out.push('## Alternate branches', '');
    out.push('*' + BRANCH_NOTE + '*', '', '---', '');
    d.branches.forEach((b, i) => {
      b.messages.forEach((m, k) => {
        out.push('## ' + labelFor(m.role, d.platform) + '  ·  branch ' + (i + 1));
        if (!k && b.fromText) {
          out.push('', '*Continues from ' + labelFor(b.fromRole, d.platform) +
                   ': \u201c' + b.fromText + '\u201d*');
        }
        if (m.at) out.push('', '*' + m.at + '*');
        out.push('', m.md, '', '---', '');
      });
    });
  }
  return out.join('\n').replace(/\n{4,}/g, '\n\n\n').trimEnd() + '\n';
}

// Exported files are English whatever the interface language, the same way
// the Source/Platform/Method rows already are.
const BRANCH_NOTE = 'Replies that were edited or regenerated away. Each one ' +
                    'continues from a message in the transcript above.';

function branchCount(d) {
  return (d.branches && d.branches.length) ? d.branches.length : 0;
}

function mdToText(md) {
  const lines = md.split('\n');
  const out = [];
  let inFence = false;
  for (const raw of lines) {
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
    out.push(l);
  }
  return out.join('\n');
}

function buildText(d) {
  const bar = '='.repeat(66);
  const out = [];
  out.push(bar, d.title, bar, '');
  out.push('Source:    ' + d.url);
  out.push('Platform:  ' + d.platform);
  if (d.project) out.push('Project:   ' + d.project);
  if (d.model) out.push('Model:     ' + d.model);
  out.push('Messages:  ' + d.messages.length);
  if (branchCount(d)) out.push('Branches:  ' + branchCount(d));
  out.push('Exported:  ' + new Date().toISOString());
  out.push('Method:    ' + (d.source === 'api'
    ? 'Site transcript API (complete)'
    : 'Page scrape with scrolling (may be partial)'));
  if (d.warning) out.push('Note:      ' + d.warning);
  out.push('');
  for (const m of d.messages) {
    const name = labelFor(m.role, d.platform).toUpperCase();
    out.push('-'.repeat(66));
    out.push('  ' + name + (m.at ? '   ' + m.at : ''));
    out.push('-'.repeat(66), '');
    out.push(mdToText(m.md).trim(), '');
  }
  if (branchCount(d)) {
    out.push(bar, '  ALTERNATE BRANCHES', bar, '');
    out.push(BRANCH_NOTE, '');
    d.branches.forEach((b, i) => {
      b.messages.forEach((m, k) => {
        const name = labelFor(m.role, d.platform).toUpperCase();
        out.push('-'.repeat(66));
        out.push('  ' + name + '   branch ' + (i + 1) + (m.at ? '   ' + m.at : ''));
        if (!k && b.fromText) {
          out.push('  Continues from ' + labelFor(b.fromRole, d.platform) +
                   ': \u201c' + b.fromText + '\u201d');
        }
        out.push('-'.repeat(66), '');
        out.push(mdToText(m.md).trim(), '');
      });
    });
  }
  return out.join('\n').replace(/\n{4,}/g, '\n\n\n').trimEnd() + '\n';
}

async function saveFile(body, filename, mime) {
  const blob = new Blob([body], { type: mime + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    await chrome.downloads.download({ url: url, filename: filename, saveAs: false });
    log(t('savedFile', filename), 'ok');
  } finally {
    // Hold the blob well past the write, then let it go.
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}

async function run() {
  const btn = $('go');
  const wantMd = $('fmt-md').checked;
  const wantTxt = $('fmt-txt').checked;
  if (!wantMd && !wantTxt) { log(t('pickFormat'), 'err'); return; }

  btn.disabled = true;
  btn.textContent = t('exporting');
  logBox.textContent = '';

  try {
    const tab = await activeTab();
    if (!tab || !tab.id) throw new Error(t('noTab'));
    if (!/^https?:/i.test(tab.url || '')) {
      throw new Error(t('openChat'));
    }

    log(t('injecting', platformOf(tab.url) || t('unknownPage')));

    const frames = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: pageHarvester,
      args: [{ maxMs: 180000, quietMs: 3500, stepMs: 420, preferApi: true,
                branches: $('opt-branches').checked,
                s: {
                  askingSite: t('askingSite'), apiUnavailable: t('apiUnavailable'),
                  scrollingConv: t('scrollingConv'), virtualised: t('virtualised'),
                  sweeping: t('sweeping'), noMessages: t('noMessages'),
                  noMessagesHelp: t('noMessagesHelp')
                } }]
    });

    const data = frames && frames[0] && frames[0].result;
    if (!data) throw new Error(t('nothingReturned'));
    if (!data.ok) throw new Error(data.error || t('extractFailed'));
    if (!data.messages.length) throw new Error(t('noMessages'));

    lastDiag = data.diag || [];
    if (data.source === 'api') {
      log(t('readApi', data.messages.length, data.seconds), 'ok');
    } else {
      log(t('readDom', data.messages.length, data.seconds, data.rounds));
      log(t('domWarn'), 'err');
    }
    if (data.warning) log('! ' + data.warning, 'err');
    $('diag').style.visibility = 'visible';

    const base = safeName(data.platform + ' - ' + data.title + ' - ' + stamp(new Date()));
    if (wantMd) await saveFile(buildMarkdown(data), base + '.md', 'text/markdown');
    if (wantTxt) await saveFile(buildText(data), base + '.txt', 'text/plain');

    log(t('done'), 'ok');
  } catch (err) {
    const m = (err && err.message) ? err.message : String(err);
    log(t('failed', m), 'err');
    if (/Cannot access|permission|Extension manifest/i.test(m)) {
      log(t('reloadHint'));
    }
  } finally {
    syncButton();
  }
}

let lastDiag = [];

/* ---- format preference, shared with the bulk page ----
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

// The label names the action. The checkboxes above already show the formats.
function syncButton() {
  const btn = $('go');
  btn.textContent = t('exportChat');
  btn.disabled = !$('fmt-md').checked && !$('fmt-txt').checked;
}

// Only show the note that applies to the current tab.
const FAST = { Claude: 1, ChatGPT: 1 };
function setHint(platform) {
  $('hint').textContent = FAST[platform] ? t('hintFast', platform) : t('hintScroll');
}

let currentPlatform = null;

// Branches only exist where we read a real transcript. On the DOM providers an
// abandoned reply was never rendered, so there is nothing to offer.
function syncBranches() {
  const box = $('opt-branches');
  const ok = !!FAST[currentPlatform];
  box.disabled = !ok;
  if (!ok) box.checked = false;
  $('branches-row').title = ok ? '' : t('branchesFastOnly');
  $('branches-row').style.opacity = ok ? '' : '.45';
}

// Re-render every string in place so switching language needs no reload.
function render() {
  applyI18n(document);
  syncButton();
  syncBranches();
  setHint(currentPlatform);
  $('diag').textContent = $('diagbox').style.display === 'block' ? t('hideDetails') : t('why');
  $('platform').textContent = currentPlatform || t('unknownPage');
}

document.addEventListener('DOMContentLoaded', async () => {
  $('go').addEventListener('click', run);
  buildLangSelect($('lang'), render);
  applyFormats();
  for (const id of ['fmt-md', 'fmt-txt']) {
    $(id).addEventListener('change', () => { saveFormats(); syncButton(); });
  }
  syncButton();
  // Real tab, not a popup. A popup closes as soon as focus moves, which would
  // kill a job that runs for minutes.
  $('all').addEventListener('click', async () => {
    const tab = await activeTab();
    const p = tab ? platformOf(tab.url) : null;
    const MAP = { ChatGPT: 'chatgpt', Claude: 'claude', Gemini: 'gemini', Grok: 'grok',
                  DeepSeek: 'deepseek', Copilot: 'copilot', 'Le Chat': 'mistral' };
    const q = MAP[p] ? '?platform=' + MAP[p] : '';
    chrome.tabs.create({ url: chrome.runtime.getURL('bulk.html') + q });
    window.close();
  });
  $('diag').addEventListener('click', (e) => {
    e.preventDefault();
    const box = $('diagbox');
    const open = box.style.display === 'block';
    box.style.display = open ? 'none' : 'block';
    $('diag').textContent = open ? t('why') : t('hideDetails');
    if (!open) {
      box.textContent = lastDiag.length ? lastDiag.join('\n') : t('noDetails');
    }
  });
  render();
  const tab = await activeTab();
  currentPlatform = tab ? platformOf(tab.url) : null;
  $('platform').textContent = currentPlatform || t('unknownPage');
  setHint(currentPlatform);
  syncBranches();          // platform is only known now, so re-gate the box
});
