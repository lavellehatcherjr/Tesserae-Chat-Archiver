<picture>
  <source media="(prefers-color-scheme: dark)" srcset="banner-dark.svg">
  <img alt="Tesserae Chat Archiver" src="banner-light.svg" width="100%">
</picture>

[English](../README.md) · [日本語](README.ja.md) · [Français](README.fr.md) · [한국어](README.ko.md) · [Português (BR)](README.pt-BR.md) · [简体中文](README.zh-CN.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Español](README.es.md)

> **Questa traduzione è solo di riferimento.** Fa fede il [README in inglese](../README.md).

Estensione per Chrome che esporta le conversazioni con le IA in Markdown e testo semplice. Una conversazione, o l'intero account in uno ZIP.

- Trascrizioni complete su Claude e ChatGPT, lette dall'endpoint di ciascun sito
- Backup dell'intero account in un unico ZIP, raggruppato per progetto
- Sette servizi, con rilevamento strutturale per tutti gli altri
- Markdown e testo semplice, insieme o separatamente
- Esportazione facoltativa delle risposte modificate o rigenerate
- Interfaccia in nove lingue

Manifest V3. Nessuna dipendenza, nessuna compilazione, nessun server, nessuna telemetria.

## Per iniziare

1. Scarica lo ZIP da [Releases](../../../releases) ed estrailo
2. Apri `chrome://extensions` e attiva la **modalità sviluppatore**
3. Fai clic su **Carica estensione non pacchettizzata** e scegli la cartella estratta
4. Apri una conversazione su un sito supportato, fai clic sull'estensione nella barra degli strumenti e poi su **Esporta conversazione**

Il file finisce nei download. Tutto qui.

Non spostare né eliminare la cartella estratta: Chrome identifica le estensioni non pacchettizzate dal percorso. Se hai clonato il repository, al passo 3 indica `extension/`.

Entrambi i formati sono selezionati. Deselezionane uno per ottenere solo l'altro.

Spunta **Risposte scartate** per esportare anche i rami modificati o rigenerati. Solo Claude e ChatGPT.

**Intero account**: fai clic su **Esegui il backup di TUTTE le conversazioni**. Si apre una scheda e viene scritto un unico ZIP: un file per conversazione, un indice e, per le conversazioni di un progetto Claude, una cartella con il nome del progetto.

I nomi dei file iniziano con la data. I titoli ripetuti vengono numerati, mai sovrascritti. Le conversazioni non riuscite finiscono in `_errors.txt` senza interrompere l'operazione. Le richieste vengono inviate circa una al secondo.

## Perché

La maggior parte degli esportatori scorre la pagina e legge il DOM. Claude mostra le conversazioni lunghe in un elenco virtualizzato: i messaggi fuori schermo vengono rimossi dal DOM e l'esportazione risulta troncata, senza alcun avviso.

Questa estensione legge la trascrizione dall'endpoint del sito quando esiste, e ripiega sullo scorrimento quando non c'è. Il file esportato indica quale metodo è stato usato.

## Compatibilità

| Sito | Metodo | In blocco |
|---|---|---|
| claude.ai | API di trascrizione | Sì |
| chatgpt.com | API di trascrizione | Sì |
| gemini.google.com | DOM, `<infinite-scroller>` | No |
| grok.com | DOM, `.message-bubble` | No |
| chat.deepseek.com | DOM, `.ds-markdown` + strutturale | No |
| copilot.microsoft.com | DOM, `[data-content]` | No |
| chat.mistral.ai | Solo strutturale | No |
| Altri | Strutturale | No |

Il backup dell'intero account richiede un endpoint che elenchi tutte le conversazioni. Solo Claude e ChatGPT ne pubblicano uno. Per un archivio Gemini completo usa Google Takeout.

## Lingue

Interfaccia disponibile in nove lingue. Segue la lingua di Chrome, con un selettore in fondo a ogni pagina.

## Limiti

- Backup in blocco: solo Claude e ChatGPT.
- Gli endpoint non sono documentati e possono cambiare senza preavviso. Se un'esportazione risulta incompleta, fai clic su **perché?** nella finestra per vedere la diagnostica.
- I selettori di Grok, DeepSeek, Copilot e Le Chat provengono da fonti pubbliche e non sono stati verificati su account reali.

## Licenza

MIT. Copyright (c) 2026 Lavelle Hatcher Jr.

Non affiliato ai servizi elencati sopra, né approvato da loro.
