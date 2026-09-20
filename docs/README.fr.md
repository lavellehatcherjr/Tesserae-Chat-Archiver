<picture>
  <source media="(prefers-color-scheme: dark)" srcset="banner-dark.svg">
  <img alt="Tesserae Chat Archiver" src="banner-light.svg" width="100%">
</picture>

[English](../README.md) · [日本語](README.ja.md) · [Français](README.fr.md) · [한국어](README.ko.md) · [Português (BR)](README.pt-BR.md) · [简体中文](README.zh-CN.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Español](README.es.md)

> **Cette traduction est fournie à titre indicatif.** Le [README en anglais](../README.md) fait foi.

Extension Chrome qui exporte les conversations avec des IA en Markdown et en texte brut. Une conversation, ou tout votre compte dans un ZIP.

- Transcriptions complètes sur Claude et ChatGPT, lues depuis le point d'accès de chaque site
- Sauvegarde du compte entier dans un seul ZIP, regroupée par projet
- Sept services, avec une détection structurelle pour le reste
- Markdown et texte brut, ensemble ou séparément
- Export facultatif des réponses modifiées ou régénérées
- Interface en neuf langues

Manifest V3. Aucune dépendance, aucune compilation, aucun serveur, aucune télémétrie.

## Démarrage

1. Téléchargez le ZIP depuis [Releases](../../../releases) et décompressez-le
2. Ouvrez `chrome://extensions` et activez le **mode développeur**
3. Cliquez sur **Charger l'extension non empaquetée** et sélectionnez le dossier décompressé
4. Ouvrez une conversation sur un site pris en charge, cliquez sur l'extension dans la barre d'outils, puis sur **Exporter la conversation**

Le fichier arrive dans vos téléchargements. C'est tout.

Ne déplacez pas et ne supprimez pas le dossier décompressé : Chrome identifie les extensions non empaquetées par leur chemin. Si vous avez cloné le dépôt, indiquez `extension/` à l'étape 3.

Les deux formats sont cochés par défaut. Décochez-en un pour n'obtenir que l'autre.

Cochez **Réponses écartées** pour exporter aussi les branches modifiées ou régénérées. Claude et ChatGPT uniquement.

**Tout le compte** : cliquez sur **Sauvegarder TOUTES les conversations**. Un onglet s'ouvre et écrit un seul ZIP : un fichier par conversation, un index, et les conversations rattachées à un projet Claude dans un dossier à son nom.

Les noms de fichiers sont préfixés par la date. Les titres en double sont numérotés, jamais écrasés. Les conversations en échec sont listées dans `_errors.txt` sans interrompre le traitement. Les requêtes sont espacées d'environ une seconde.

## Pourquoi

La plupart des outils d'export font défiler la page et lisent le DOM. Claude affiche les longues conversations dans une liste virtualisée : les messages hors écran sont retirés du DOM, et l'export est tronqué sans le moindre avertissement.

Cet outil lit la transcription depuis le point d'accès du site lorsqu'il en existe un, et se rabat sur le défilement sinon. Le fichier exporté indique la méthode utilisée.

## Prise en charge

| Site | Méthode | En masse |
|---|---|---|
| claude.ai | API de transcription | Oui |
| chatgpt.com | API de transcription | Oui |
| gemini.google.com | DOM, `<infinite-scroller>` | Non |
| grok.com | DOM, `.message-bubble` | Non |
| chat.deepseek.com | DOM, `.ds-markdown` + structurel | Non |
| copilot.microsoft.com | DOM, `[data-content]` | Non |
| chat.mistral.ai | Structurel uniquement | Non |
| Autres | Structurel | Non |

La sauvegarde complète exige un point d'accès listant toutes les conversations. Seuls Claude et ChatGPT en publient un. Pour une archive Gemini complète, utilisez Google Takeout.

## Langues

Interface disponible en neuf langues. Elle suit la langue de Chrome, avec un sélecteur en bas de chaque page.

## Limites

- Sauvegarde complète : Claude et ChatGPT uniquement.
- Les points d'accès ne sont pas documentés et peuvent changer sans préavis. Si un export est incomplet, cliquez sur **pourquoi ?** dans la fenêtre pour voir le diagnostic.
- Les sélecteurs de Grok, DeepSeek, Copilot et Le Chat proviennent de sources publiques et n'ont pas été vérifiés sur des comptes réels.

## Licence

MIT. Copyright (c) 2026 Lavelle Hatcher Jr.

Sans affiliation avec les services mentionnés ci-dessus, ni approbation de leur part.
