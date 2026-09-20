<picture>
  <source media="(prefers-color-scheme: dark)" srcset="banner-dark.svg">
  <img alt="Tesserae Chat Archiver" src="banner-light.svg" width="100%">
</picture>

[English](../README.md) · [日本語](README.ja.md) · [Français](README.fr.md) · [한국어](README.ko.md) · [Português (BR)](README.pt-BR.md) · [简体中文](README.zh-CN.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Español](README.es.md)

> **この翻訳は参考用です。** 正式な内容は [英語版 README](../README.md) を参照してください。

AIとの会話をMarkdownとテキスト形式で書き出すChrome拡張機能です。1件ずつ、またはアカウント全体をZIPで保存できます。

- ClaudeとChatGPTはサイト自身のエンドポイントから完全な記録を取得
- アカウント全体を1つのZIPに、プロジェクトごとに整理
- 7つのサービスに対応、それ以外は構造による検出
- Markdownとテキスト、両方または片方だけ
- 編集・再生成で破棄された返答も任意で書き出し
- インターフェースは9言語

Manifest V3。依存関係、ビルド手順、サーバー、テレメトリはありません。

## はじめに

1. [Releases](../../../releases) からZIPをダウンロードして展開する
2. `chrome://extensions` を開き、**デベロッパーモード**を有効にする
3. **パッケージ化されていない拡張機能を読み込む**で、展開したフォルダーを選ぶ
4. 対応サイトで会話を開き、ツールバーの拡張機能アイコンから**チャットを書き出す**を押す

ファイルはダウンロードフォルダーに保存されます。手順は以上です。

Chromeはパスで拡張機能を識別するため、展開したフォルダーは移動も削除もしないでください。リポジトリをクローンした場合は、手順3で `extension/` を選びます。

どちらの形式も初期状態で選択されています。片方のチェックを外せば、もう一方だけが保存されます。

**破棄された返答**にチェックを入れると、編集・再生成で破棄された分岐も書き出します。ClaudeとChatGPTのみ。

**アカウント全体**: **すべてのチャットをバックアップ**を押します。専用タブが開き、1つのZIPに保存されます。チャットごとに1ファイル、索引、Claudeのプロジェクトに属する会話はプロジェクト名のフォルダーに整理されます。

ファイル名には日付が付き、同名のチャットは上書きされず連番になります。取得できなかった会話は `_errors.txt` に記録され、処理は継続します。リクエストは約1秒に1件のペースです。

## 背景

多くの書き出しツールはページをスクロールしてDOMを読み取ります。Claudeは長い会話を仮想リストで描画するため、画面外のメッセージはDOMから取り除かれ、警告もないまま不完全な書き出しになります。

本拡張機能は、利用可能な場合はサイト自身の記録エンドポイントから取得し、不可能な場合はスクロールに切り替えます。どちらを使用したかは書き出したファイルに記録されます。

## 対応状況

| サイト | 方式 | 一括 |
|---|---|---|
| claude.ai | 記録API | 可 |
| chatgpt.com | 記録API | 可 |
| gemini.google.com | DOM、`<infinite-scroller>` | 不可 |
| grok.com | DOM、`.message-bubble` | 不可 |
| chat.deepseek.com | DOM、`.ds-markdown` + 構造推定 | 不可 |
| copilot.microsoft.com | DOM、`[data-content]` | 不可 |
| chat.mistral.ai | 構造推定のみ | 不可 |
| その他 | 構造推定 | 不可 |

一括バックアップには全会話を一覧できるエンドポイントが必要で、公開しているのはClaudeとChatGPTのみです。Gemini全体の保存にはGoogle Takeoutをご利用ください。

## 言語

インターフェースは9言語に対応しています。Chromeの表示言語に従い、各ページ下部のセレクターで切り替えられます。

## 制限事項

- 一括バックアップはClaudeとChatGPTのみ。
- 使用しているエンドポイントは非公開のもので、予告なく変更される可能性があります。書き出しが不完全な場合は、ポップアップの**詳細**で診断内容を確認できます。
- Grok、DeepSeek、Copilot、Le Chatのセレクターは公開情報に基づくもので、実アカウントでの検証はしていません。

## ライセンス

MIT. Copyright (c) 2026 Lavelle Hatcher Jr.

上記のいずれのサービスとも提携しておらず、承認も受けていません。
