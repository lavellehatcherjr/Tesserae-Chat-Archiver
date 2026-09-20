<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/banner-dark.svg">
  <img alt="Tesserae Chat Archiver" src="docs/banner-light.svg" width="100%">
</picture>

[English](README.md) · [日本語](docs/README.ja.md) · [Français](docs/README.fr.md) · [한국어](docs/README.ko.md) · [Português (BR)](docs/README.pt-BR.md) · [简体中文](docs/README.zh-CN.md) · [Deutsch](docs/README.de.md) · [Italiano](docs/README.it.md) · [Español](docs/README.es.md)

Chrome extension that exports AI chat conversations to Markdown and plain text.
One conversation, or your entire account as a ZIP.

- Complete transcripts on Claude and ChatGPT, read from each site's own endpoint
- Whole-account backup to a single ZIP, grouped by project
- Seven services, with a structural fallback for anything else
- Markdown and plain text, together or separately
- Optional export of replies you edited or regenerated away
- Interface in nine languages

Manifest V3. No dependencies, no build step, no servers, no telemetry.

## Getting started

1. Download the ZIP from [Releases](../../releases) and unzip it
2. Open `chrome://extensions` and turn on **Developer mode**
3. Click **Load unpacked** and select the unzipped folder
4. Open a conversation on any supported site, click the extension in your
   toolbar, and click **Export Chat**

The file lands in your downloads. That is the whole loop.

Leave the unzipped folder where it is. Chrome tracks unpacked extensions by
path, so moving or deleting it uninstalls the extension. If you cloned the repo
instead, point step 3 at `extension/`.

Both formats are ticked by default. Untick either one to get just the other.

Tick **Discarded replies** to also export branches you edited or regenerated
away. Claude and ChatGPT only.

**Whole account.** Click **Back up ALL chats**. Opens in a tab and writes a
single ZIP:

```
Claude backup 2026-09-20.zip
├── _index.md              all chats, newest first
├── _index.txt
├── projects/
│   └── Q3 Launch Plan/    chats belonging to a Claude Project
└── conversations/         everything else
```

Filenames are date-prefixed. Duplicate titles are numbered, not overwritten.
Failed conversations are listed in `_errors.txt` and don't abort the run.
Requests are paced at roughly 1/sec.

## Why

Most exporters scroll the page and read the DOM. Claude renders long
conversations with a virtualised list, so off-screen messages are unmounted
entirely and exports come out truncated with no warning.

This reads the transcript from the site's own endpoint where one exists, and
falls back to scrolling where it doesn't. The exported file records which
method was used, so a partial export is never mistaken for a complete one.

## Support

| Site | Method | Bulk |
|---|---|---|
| claude.ai | Transcript API | Yes |
| chatgpt.com | Transcript API | Yes |
| gemini.google.com | DOM, `<infinite-scroller>` | No |
| grok.com | DOM, `.message-bubble` | No |
| chat.deepseek.com | DOM, `.ds-markdown` + structural | No |
| copilot.microsoft.com | DOM, `[data-content]` | No |
| chat.mistral.ai | Structural only | No |
| Anything else | Structural | No |

Bulk backup needs an endpoint that lists every conversation. Only Claude and
ChatGPT publish one. For a full Gemini archive use Google Takeout.

## How it works

```
Claude   GET /api/organizations/{org}/chat_conversations/{id}
             ?tree=True&rendering_mode=messages&render_all_tools=true
ChatGPT  GET /backend-api/conversation/{id}
             Authorization: Bearer <token from /api/auth/session>
```

Both run in the page with your existing session cookies. Requests go only to
the site you're already signed into.

Claude responses carry `current_leaf_message_uuid`, used to follow the active
branch when a prompt was edited or an answer regenerated. Project names are
resolved via `/api/organizations/{org}/projects`.

DOM sites are read by adapter. When selectors return nothing, or return only
one role, a structural pass finds the conversation by shape: the container
holding the most substantial sibling text blocks, with roles resolved from
attributes, then bubble alignment, then alternation. That path carries Le Chat
and DeepSeek's user turns, which have no stable class names.

## Languages

Interface available in English, 日本語, Français, 한국어, Português (BR),
简体中文, Deutsch, Italiano, Español. Follows Chrome's UI language, with an
override in the footer of each page.

## Permissions

`activeTab`, `scripting`, `downloads`, plus host permissions for the four sites
that need background fetches. No `storage`, no background service worker.

## Limitations

- Bulk backup: Claude and ChatGPT only.
- The endpoints are undocumented and can change without notice. If an export
  comes up short, click **why?** in the popup for the diagnostic trail.
- Selectors for Grok, DeepSeek, Copilot and Le Chat are built from published
  sources, not verified against live accounts.

## License

MIT. Copyright (c) 2026 Lavelle Hatcher Jr.

Not affiliated with or endorsed by any of the services listed above.
