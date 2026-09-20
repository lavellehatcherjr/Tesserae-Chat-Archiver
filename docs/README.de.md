<picture>
  <source media="(prefers-color-scheme: dark)" srcset="banner-dark.svg">
  <img alt="Tesserae Chat Archiver" src="banner-light.svg" width="100%">
</picture>

[English](../README.md) · [日本語](README.ja.md) · [Français](README.fr.md) · [한국어](README.ko.md) · [Português (BR)](README.pt-BR.md) · [简体中文](README.zh-CN.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Español](README.es.md)

> **Diese Übersetzung dient nur als Referenz.** Maßgeblich ist die [englische README](../README.md).

Chrome-Erweiterung, die KI-Unterhaltungen als Markdown und reinen Text exportiert. Einzelne Unterhaltungen oder das ganze Konto als ZIP.

- Vollständige Protokolle bei Claude und ChatGPT, gelesen über den Endpunkt der jeweiligen Website
- Sicherung des ganzen Kontos in einem ZIP, nach Projekt gruppiert
- Sieben Dienste, mit struktureller Erkennung für alles andere
- Markdown und reiner Text, zusammen oder einzeln
- Optionaler Export verworfener, bearbeiteter oder neu erzeugter Antworten
- Oberfläche in neun Sprachen

Manifest V3. Keine Abhängigkeiten, kein Build-Schritt, keine Server, keine Telemetrie.

## Erste Schritte

1. ZIP von [Releases](../../../releases) herunterladen und entpacken
2. `chrome://extensions` öffnen und **Entwicklermodus** aktivieren
3. **Entpackte Erweiterung laden** wählen und den entpackten Ordner angeben
4. Eine Unterhaltung auf einer unterstützten Website öffnen, in der Symbolleiste auf die Erweiterung klicken und **Chat exportieren** wählen

Die Datei liegt dann in den Downloads. Mehr ist es nicht.

Den entpackten Ordner nicht verschieben und nicht löschen: Chrome identifiziert entpackte Erweiterungen über den Pfad. Wer das Repository klont, wählt in Schritt 3 stattdessen `extension/`.

Beide Formate sind vorausgewählt. Wird eines abgewählt, entsteht nur das andere.

**Verworfene Antworten** ankreuzen, um auch bearbeitete oder neu erzeugte Zweige zu exportieren. Nur Claude und ChatGPT.

**Ganzes Konto**: auf **ALLE Chats sichern** klicken. Es öffnet sich ein Tab und schreibt ein einzelnes ZIP: eine Datei je Unterhaltung, ein Index und für Chats aus einem Claude-Projekt ein Ordner mit dem Projektnamen.

Dateinamen beginnen mit dem Datum. Gleiche Titel werden nummeriert, nicht überschrieben. Fehlgeschlagene Unterhaltungen stehen in `_errors.txt` und brechen den Lauf nicht ab. Die Anfragen erfolgen etwa im Sekundentakt.

## Hintergrund

Die meisten Export-Werkzeuge scrollen die Seite und lesen das DOM. Claude stellt lange Unterhaltungen in einer virtualisierten Liste dar: Nachrichten außerhalb des Sichtbereichs werden aus dem DOM entfernt, und der Export bricht ohne jede Warnung ab.

Diese Erweiterung liest das Protokoll über den Endpunkt der Website, sofern es einen gibt, und weicht sonst auf Scrollen aus. In der exportierten Datei steht, welcher Weg verwendet wurde.

## Unterstützung

| Seite | Verfahren | Massenexport |
|---|---|---|
| claude.ai | Protokoll-API | Ja |
| chatgpt.com | Protokoll-API | Ja |
| gemini.google.com | DOM, `<infinite-scroller>` | Nein |
| grok.com | DOM, `.message-bubble` | Nein |
| chat.deepseek.com | DOM, `.ds-markdown` + strukturell | Nein |
| copilot.microsoft.com | DOM, `[data-content]` | Nein |
| chat.mistral.ai | Nur strukturell | Nein |
| Sonstige | Strukturell | Nein |

Der Massenexport braucht einen Endpunkt, der alle Unterhaltungen auflistet. Nur Claude und ChatGPT bieten einen. Für ein vollständiges Gemini-Archiv Google Takeout verwenden.

## Sprachen

Oberfläche in neun Sprachen. Sie folgt der Sprache von Chrome und lässt sich unten auf jeder Seite umstellen.

## Einschränkungen

- Massenexport: nur Claude und ChatGPT.
- Die Endpunkte sind nicht dokumentiert und können sich jederzeit ändern. Fällt ein Export zu kurz aus, zeigt **warum?** im Fenster den Diagnoseverlauf.
- Die Selektoren für Grok, DeepSeek, Copilot und Le Chat stammen aus öffentlichen Quellen und wurden nicht an echten Konten geprüft.

## Lizenz

MIT. Copyright (c) 2026 Lavelle Hatcher Jr.

Nicht verbunden mit den oben genannten Diensten und nicht von ihnen unterstützt.
