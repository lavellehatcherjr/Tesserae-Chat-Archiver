<picture>
  <source media="(prefers-color-scheme: dark)" srcset="banner-dark.svg">
  <img alt="Tesserae Chat Archiver" src="banner-light.svg" width="100%">
</picture>

[English](../README.md) · [日本語](README.ja.md) · [Français](README.fr.md) · [한국어](README.ko.md) · [Português (BR)](README.pt-BR.md) · [简体中文](README.zh-CN.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Español](README.es.md)

> **Esta tradução é apenas para referência.** O [README em inglês](../README.md) é a versão oficial.

Extensão do Chrome que exporta conversas com IA para Markdown e texto simples. Uma conversa, ou a conta inteira em um ZIP.

- Transcrições completas no Claude e no ChatGPT, lidas pelo endpoint de cada site
- Backup da conta inteira em um único ZIP, agrupado por projeto
- Sete serviços, com detecção estrutural para os demais
- Markdown e texto simples, juntos ou separados
- Exportação opcional das respostas editadas ou regeradas
- Interface em nove idiomas

Manifest V3. Sem dependências, sem build, sem servidores, sem telemetria.

## Primeiros passos

1. Baixe o ZIP em [Releases](../../../releases) e extraia
2. Abra `chrome://extensions` e ative o **modo desenvolvedor**
3. Clique em **Carregar sem compactação** e selecione a pasta extraída
4. Abra uma conversa em um site compatível, clique na extensão na barra de ferramentas e em **Exportar conversa**

O arquivo vai para os downloads. É só isso.

Não mova nem apague a pasta extraída: o Chrome identifica extensões descompactadas pelo caminho. Se você clonou o repositório, aponte o passo 3 para `extension/`.

Os dois formatos vêm marcados. Desmarque um para gerar apenas o outro.

Marque **Respostas descartadas** para exportar também os ramos editados ou regerados. Somente Claude e ChatGPT.

**Conta inteira**: clique em **Fazer backup de TODAS as conversas**. Abre uma aba e grava um único ZIP: um arquivo por conversa, um índice e, para conversas de um projeto do Claude, uma pasta com o nome do projeto.

Os nomes de arquivo têm a data como prefixo. Títulos repetidos são numerados, nunca sobrescritos. Conversas que falham vão para `_errors.txt` e não interrompem o processo. As requisições saem a cerca de uma por segundo.

## Por quê

A maioria dos exportadores rola a página e lê o DOM. O Claude renderiza conversas longas em uma lista virtualizada: mensagens fora da tela são removidas do DOM e a exportação sai truncada, sem aviso nenhum.

Esta extensão lê a transcrição do endpoint do próprio site quando existe um, e recorre à rolagem quando não existe. O arquivo exportado registra qual método foi usado.

## Compatibilidade

| Site | Método | Em massa |
|---|---|---|
| claude.ai | API de transcrição | Sim |
| chatgpt.com | API de transcrição | Sim |
| gemini.google.com | DOM, `<infinite-scroller>` | Não |
| grok.com | DOM, `.message-bubble` | Não |
| chat.deepseek.com | DOM, `.ds-markdown` + estrutural | Não |
| copilot.microsoft.com | DOM, `[data-content]` | Não |
| chat.mistral.ai | Apenas estrutural | Não |
| Outros | Estrutural | Não |

O backup da conta inteira exige um endpoint que liste todas as conversas. Só Claude e ChatGPT publicam um. Para um arquivo completo do Gemini, use o Google Takeout.

## Idiomas

Interface disponível em nove idiomas. Acompanha o idioma do Chrome, com um seletor no rodapé de cada página.

## Limitações

- Backup em massa: apenas Claude e ChatGPT.
- Os endpoints não são documentados e podem mudar sem aviso. Se a exportação sair incompleta, clique em **por quê?** no popup para ver o diagnóstico.
- Os seletores de Grok, DeepSeek, Copilot e Le Chat vêm de fontes públicas e não foram verificados em contas reais.

## Licença

MIT. Copyright (c) 2026 Lavelle Hatcher Jr.

Sem afiliação com nenhum dos serviços listados acima, nem endosso por parte deles.
