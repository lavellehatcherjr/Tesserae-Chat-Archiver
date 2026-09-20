/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Lavelle Hatcher Jr */
/* Interface strings. One table, loaded by both pages, so the language can be
   switched at runtime. chrome.i18n is fixed to the browser's UI language and
   gives no way to override it, which is why this exists.

   English is the source and a missing key falls back to it. Placeholders are
   {0}, {1} and fill positionally. The product name stays untranslated, and so
   do URLs and HTTP codes, so they survive being pasted into a bug report. */

'use strict';

const I18N = {

  en: {
    _name: 'English',
    currentTab: 'Current tab:', checking: 'checking…', unknownPage: 'unknown page',
    includeLegend: 'Include', optBranches: 'Discarded replies (edited or regenerated)',
    branchesFastOnly: 'Claude and ChatGPT only',
    saveAs: 'Save as', fmtMd: 'Markdown (.md)', fmtTxt: 'Plain text (.txt)',
    exportChat: 'Export Chat', exporting: 'Exporting…', backupAll: 'Back up ALL chats…',
    hintFast: 'Reads the full transcript straight from {0} — no scrolling, nothing missed.',
    hintScroll: 'Scrolls the page to load the full history. Keep this popup open: clicking the page closes it and cancels the export.',
    why: 'why?', hideDetails: 'hide details',
    noDetails: 'No details recorded yet — run an export first.',
    pickFormat: 'Pick at least one file format.',
    injecting: 'Injecting into {0}…',
    readApi: "Read {0} messages from the site's own transcript in {1}s — complete, no scrolling needed.",
    readDom: 'Read {0} messages by scrolling in {1}s ({2} passes).',
    domWarn: 'Heads up: this used the page-scraping fallback, which can miss messages on virtualised pages. Click "why?" below.',
    savedFile: 'Saved {0}', done: 'Done.', failed: 'Failed: {0}',
    reloadHint: 'Reload the chat tab after installing the extension, then try again.',
    noTab: 'No active tab.',
    openChat: 'Open a chat conversation in a normal tab first.',
    nothingReturned: 'The page returned nothing. Reload the tab and retry.',
    noMessagesHelp: 'Open a conversation (not the home or history screen), make sure you are signed in, then try again.',
    extractFailed: 'Extraction failed.', noMessages: 'No messages could be read.',
    askingSite: 'Asking the site for the full transcript…',
    apiUnavailable: 'API unavailable — falling back to scrolling the page…',
    scrollingConv: 'Scrolling the conversation ({0} visible)…',
    virtualised: 'Virtualised list — sweeping in smaller steps…',
    sweeping: 'Sweeping… {0} messages so far ({1}s)',
    bulkTitle: 'Back up everything',
    bulkSub: 'Downloads every conversation in your account as one ZIP, with a file per chat and an index.',
    account: 'Account', oneAtATime: 'Supported, one chat at a time',
    oneAtATimeNote: 'Open the conversation and use {0} in the popup. Only Claude and ChatGPT publish an endpoint that lists every conversation, which is what whole-account backup needs. For a complete Gemini archive, use Google Takeout.',
    saveEachAs: 'Save each chat as', startBackup: 'Start backup', backingUp: 'Backing up…',
    keepTabOpen: 'Keep this tab open.',
    keepTabOpenBody: 'A large account takes a few minutes — roughly a second per conversation, deliberately paced so the site is not hammered. You can use other tabs meanwhile. You must already be signed in to the account you pick, in this same browser.',
    listing: 'Listing conversations on {0}…', foundConvos: 'Found {0} conversations.',
    savedProgress: 'Saved {0} of {1}…', packaging: 'Packaging {0} files…',
    savedZip: 'Saved {0}  ({1} MB, {2} conversations)',
    someFailed: '{0} conversation(s) could not be downloaded — listed in _errors.txt',
    noConvos: 'No conversations found. Are you signed in to {0}?',
    allFailed: 'Every conversation failed to download. See the log.',
    signInHint: 'Open {0} in another tab, confirm you are signed in, then retry.',
    bannerFrom: 'You came from {0}. {1} Export that conversation one at a time from the extension popup instead.',
    findingN: 'found {0}…',
    nbGemini: 'Google publishes no endpoint that lists your conversations. For a full Gemini archive use Google Takeout (Download your Gemini Apps data).',
    nbGrok: 'x.AI publishes no endpoint that lists your conversations.',
    nbDeepseek: 'DeepSeek publishes no endpoint that lists your conversations.',
    nbCopilot: 'Microsoft publishes no endpoint that lists your consumer Copilot chats.',
    nbMistral: 'Mistral offers no conversation export API at all.'
  },

  ja: {
    _name: '日本語',
    currentTab: '現在のタブ:', checking: '確認中…', unknownPage: '不明なページ',
    includeLegend: '含める', optBranches: '破棄された返答（編集・再生成）',
    branchesFastOnly: 'ClaudeとChatGPTのみ',
    saveAs: '保存形式', fmtMd: 'Markdown (.md)', fmtTxt: 'テキスト (.txt)',
    exportChat: 'チャットを書き出す', exporting: '書き出し中…', backupAll: 'すべてのチャットをバックアップ…',
    hintFast: '{0} から全文を直接読み取ります。スクロール不要で、取りこぼしもありません。',
    hintScroll: 'ページをスクロールして履歴全体を読み込みます。このポップアップは開いたままにしてください。ページをクリックすると閉じて、書き出しが中止されます。',
    why: '詳細', hideDetails: '詳細を隠す',
    noDetails: 'まだ記録がありません。先に書き出しを実行してください。',
    pickFormat: '形式を1つ以上選んでください。',
    injecting: '{0} に接続中…',
    readApi: '{0} 件のメッセージをサイトの記録から {1} 秒で取得しました。スクロール不要で、完全な内容です。',
    readDom: 'スクロールにより {0} 件のメッセージを {1} 秒で取得しました（{2} 回）。',
    domWarn: '注意: ページ読み取りの代替手段を使用しました。仮想化されたページでは一部のメッセージが欠ける可能性があります。下の「詳細」を確認してください。',
    savedFile: '{0} を保存しました', done: '完了しました。', failed: '失敗: {0}',
    reloadHint: '拡張機能をインストールした後、チャットのタブを再読み込みしてから再試行してください。',
    noTab: 'アクティブなタブがありません。',
    openChat: '先に通常のタブでチャットを開いてください。',
    nothingReturned: 'ページから何も返されませんでした。タブを再読み込みして再試行してください。',
    noMessagesHelp: '（ホームや履歴ではなく）会話を開き、ログイン状態を確認してから再試行してください。',
    extractFailed: '抽出に失敗しました。', noMessages: 'メッセージを読み取れませんでした。',
    askingSite: 'サイトに全文をリクエスト中…',
    apiUnavailable: 'APIを利用できません。ページのスクロールに切り替えます…',
    scrollingConv: '会話をスクロール中（{0} 件表示）…',
    virtualised: '仮想リストを検出。細かい間隔で読み取ります…',
    sweeping: '読み取り中… 現在 {0} 件（{1} 秒）',
    bulkTitle: 'すべてをバックアップ',
    bulkSub: 'アカウント内のすべての会話を1つのZIPとして保存します。チャットごとに1ファイルと索引が含まれます。',
    account: 'アカウント', oneAtATime: '対応あり（1件ずつ）',
    oneAtATimeNote: '会話を開き、ポップアップの{0}を使用してください。すべての会話を一覧できるエンドポイントを公開しているのは Claude と ChatGPT だけで、アカウント全体のバックアップにはそれが必要です。Gemini の完全な保存には Google Takeout をご利用ください。',
    saveEachAs: '各チャットの保存形式', startBackup: 'バックアップを開始', backingUp: 'バックアップ中…',
    keepTabOpen: 'このタブは開いたままにしてください。',
    keepTabOpenBody: '会話数が多い場合は数分かかります（1件あたり約1秒）。サイトに負荷をかけないよう意図的に間隔を空けています。その間、他のタブは使用できます。選択したアカウントに、同じブラウザで事前にログインしている必要があります。',
    listing: '{0} の会話一覧を取得中…', foundConvos: '{0} 件の会話が見つかりました。',
    savedProgress: '{1} 件中 {0} 件を保存…', packaging: '{0} ファイルをまとめています…',
    savedZip: '{0} を保存しました（{1} MB、{2} 件の会話）',
    someFailed: '{0} 件の会話を取得できませんでした。_errors.txt に記載しています',
    noConvos: '会話が見つかりません。{0} にログインしていますか？',
    allFailed: 'すべての会話の取得に失敗しました。ログを確認してください。',
    signInHint: '別のタブで {0} を開き、ログイン状態を確認してから再試行してください。',
    bannerFrom: '{0} から移動しました。{1} その会話は拡張機能のポップアップから1件ずつ書き出してください。',
    findingN: '{0} 件検出…',
    nbGemini: 'Google は会話一覧のエンドポイントを公開していません。Gemini 全体の保存には Google Takeout（Gemini アプリのデータをダウンロード）をご利用ください。',
    nbGrok: 'x.AI は会話一覧のエンドポイントを公開していません。',
    nbDeepseek: 'DeepSeek は会話一覧のエンドポイントを公開していません。',
    nbCopilot: 'Microsoft は個人向け Copilot の会話一覧のエンドポイントを公開していません。',
    nbMistral: 'Mistral には会話を書き出すAPIがありません。'
  },

  fr: {
    _name: 'Français',
    currentTab: 'Onglet actuel :', checking: 'vérification…', unknownPage: 'page inconnue',
    includeLegend: 'Inclure', optBranches: 'Réponses écartées (modifiées ou régénérées)',
    branchesFastOnly: 'Claude et ChatGPT uniquement',
    saveAs: 'Enregistrer en', fmtMd: 'Markdown (.md)', fmtTxt: 'Texte brut (.txt)',
    exportChat: 'Exporter la conversation', exporting: 'Export en cours…', backupAll: 'Sauvegarder TOUTES les conversations…',
    hintFast: 'Lit la transcription complète directement depuis {0} — sans défilement, rien ne manque.',
    hintScroll: "Fait défiler la page pour charger tout l'historique. Gardez cette fenêtre ouverte : cliquer sur la page la ferme et annule l'export.",
    why: 'pourquoi ?', hideDetails: 'masquer les détails',
    noDetails: "Aucun détail pour l'instant — lancez d'abord un export.",
    pickFormat: 'Choisissez au moins un format.',
    injecting: 'Connexion à {0}…',
    readApi: '{0} messages lus depuis la transcription du site en {1} s — complet, sans défilement.',
    readDom: '{0} messages lus par défilement en {1} s ({2} passages).',
    domWarn: 'Attention : la méthode de secours par lecture de page a été utilisée ; elle peut omettre des messages sur les pages virtualisées. Cliquez sur « pourquoi ? » ci-dessous.',
    savedFile: '{0} enregistré', done: 'Terminé.', failed: 'Échec : {0}',
    reloadHint: "Rechargez l'onglet de la conversation après l'installation, puis réessayez.",
    noTab: 'Aucun onglet actif.',
    openChat: "Ouvrez d'abord une conversation dans un onglet normal.",
    nothingReturned: "La page n'a rien renvoyé. Rechargez l'onglet et réessayez.",
    noMessagesHelp: 'Ouvrez une conversation (pas l\'accueil ni l\'historique), vérifiez que vous êtes connecté, puis réessayez.',
    extractFailed: "Échec de l'extraction.", noMessages: "Aucun message n'a pu être lu.",
    askingSite: 'Demande de la transcription complète au site…',
    apiUnavailable: 'API indisponible — retour au défilement de la page…',
    scrollingConv: 'Défilement de la conversation ({0} visibles)…',
    virtualised: 'Liste virtualisée — défilement par petits pas…',
    sweeping: 'Lecture… {0} messages jusqu’ici ({1} s)',
    bulkTitle: 'Tout sauvegarder',
    bulkSub: 'Télécharge toutes les conversations de votre compte dans un seul ZIP, avec un fichier par conversation et un index.',
    account: 'Compte', oneAtATime: 'Pris en charge, une conversation à la fois',
    oneAtATimeNote: "Ouvrez la conversation et utilisez {0} dans la fenêtre de l'extension. Seuls Claude et ChatGPT publient un point d'accès listant toutes les conversations, ce qui est nécessaire pour une sauvegarde complète. Pour une archive Gemini complète, utilisez Google Takeout.",
    saveEachAs: 'Enregistrer chaque conversation en', startBackup: 'Démarrer la sauvegarde', backingUp: 'Sauvegarde…',
    keepTabOpen: 'Gardez cet onglet ouvert.',
    keepTabOpenBody: "Un compte volumineux prend quelques minutes — environ une seconde par conversation, un rythme volontairement mesuré pour ne pas surcharger le site. Vous pouvez utiliser d'autres onglets pendant ce temps. Vous devez déjà être connecté au compte choisi, dans ce même navigateur.",
    listing: 'Récupération des conversations sur {0}…', foundConvos: '{0} conversations trouvées.',
    savedProgress: '{0} sur {1} enregistrées…', packaging: 'Assemblage de {0} fichiers…',
    savedZip: '{0} enregistré ({1} Mo, {2} conversations)',
    someFailed: '{0} conversation(s) n’ont pas pu être téléchargées — voir _errors.txt',
    noConvos: 'Aucune conversation trouvée. Êtes-vous connecté à {0} ?',
    allFailed: 'Le téléchargement de toutes les conversations a échoué. Consultez le journal.',
    signInHint: 'Ouvrez {0} dans un autre onglet, vérifiez que vous êtes connecté, puis réessayez.',
    bannerFrom: "Vous venez de {0}. {1} Exportez cette conversation une par une depuis la fenêtre de l'extension.",
    findingN: '{0} trouvées…',
    nbGemini: "Google ne publie aucun point d'accès listant vos conversations. Pour une archive Gemini complète, utilisez Google Takeout (Télécharger vos données Gemini).",
    nbGrok: "x.AI ne publie aucun point d'accès listant vos conversations.",
    nbDeepseek: "DeepSeek ne publie aucun point d'accès listant vos conversations.",
    nbCopilot: "Microsoft ne publie aucun point d'accès listant vos conversations Copilot grand public.",
    nbMistral: "Mistral ne propose aucune API d'export des conversations."
  },

  ko: {
    _name: '한국어',
    currentTab: '현재 탭:', checking: '확인 중…', unknownPage: '알 수 없는 페이지',
    includeLegend: '포함', optBranches: '버려진 답변(편집·재생성)',
    branchesFastOnly: 'Claude와 ChatGPT만',
    saveAs: '저장 형식', fmtMd: 'Markdown (.md)', fmtTxt: '일반 텍스트 (.txt)',
    exportChat: '대화 내보내기', exporting: '내보내는 중…', backupAll: '모든 대화 백업…',
    hintFast: '{0}에서 전체 대화를 직접 읽어옵니다. 스크롤이 필요 없고 누락도 없습니다.',
    hintScroll: '페이지를 스크롤하여 전체 기록을 불러옵니다. 이 팝업을 열어 두세요. 페이지를 클릭하면 팝업이 닫히고 내보내기가 취소됩니다.',
    why: '자세히', hideDetails: '자세히 숨기기',
    noDetails: '아직 기록이 없습니다. 먼저 내보내기를 실행하세요.',
    pickFormat: '형식을 하나 이상 선택하세요.',
    injecting: '{0}에 연결 중…',
    readApi: '{1}초 만에 사이트 기록에서 메시지 {0}개를 읽었습니다. 스크롤 없이 완전한 내용입니다.',
    readDom: '스크롤로 {1}초 동안 메시지 {0}개를 읽었습니다 ({2}회).',
    domWarn: '참고: 페이지 읽기 대체 방식을 사용했습니다. 가상화된 페이지에서는 일부 메시지가 누락될 수 있습니다. 아래 "자세히"를 확인하세요.',
    savedFile: '{0} 저장됨', done: '완료되었습니다.', failed: '실패: {0}',
    reloadHint: '확장 프로그램 설치 후 대화 탭을 새로고침한 다음 다시 시도하세요.',
    noTab: '활성 탭이 없습니다.',
    openChat: '먼저 일반 탭에서 대화를 여세요.',
    nothingReturned: '페이지에서 아무것도 반환되지 않았습니다. 탭을 새로고침한 후 다시 시도하세요.',
    noMessagesHelp: '(홈이나 기록 화면이 아닌) 대화를 열고 로그인 상태를 확인한 후 다시 시도하세요.',
    extractFailed: '추출에 실패했습니다.', noMessages: '메시지를 읽을 수 없습니다.',
    askingSite: '사이트에 전체 기록을 요청하는 중…',
    apiUnavailable: 'API를 사용할 수 없습니다. 페이지 스크롤 방식으로 전환합니다…',
    scrollingConv: '대화를 스크롤하는 중 ({0}개 표시)…',
    virtualised: '가상 목록을 감지했습니다. 더 작은 간격으로 읽습니다…',
    sweeping: '읽는 중… 현재 {0}개 ({1}초)',
    bulkTitle: '전체 백업',
    bulkSub: '계정의 모든 대화를 하나의 ZIP으로 저장합니다. 대화마다 파일 하나와 색인이 포함됩니다.',
    account: '계정', oneAtATime: '지원됨 (한 번에 한 대화)',
    oneAtATimeNote: '대화를 열고 팝업에서 {0}을 사용하세요. 모든 대화를 나열하는 엔드포인트를 공개한 곳은 Claude와 ChatGPT뿐이며, 계정 전체 백업에는 그것이 필요합니다. Gemini 전체 보관은 Google Takeout을 이용하세요.',
    saveEachAs: '각 대화 저장 형식', startBackup: '백업 시작', backingUp: '백업 중…',
    keepTabOpen: '이 탭을 열어 두세요.',
    keepTabOpenBody: '대화가 많으면 몇 분 걸립니다(대화당 약 1초). 사이트에 부담을 주지 않도록 의도적으로 간격을 둡니다. 그동안 다른 탭은 사용할 수 있습니다. 선택한 계정에 같은 브라우저에서 미리 로그인되어 있어야 합니다.',
    listing: '{0}의 대화 목록을 가져오는 중…', foundConvos: '대화 {0}개를 찾았습니다.',
    savedProgress: '{1}개 중 {0}개 저장됨…', packaging: '{0}개 파일을 묶는 중…',
    savedZip: '{0} 저장됨 ({1} MB, 대화 {2}개)',
    someFailed: '대화 {0}개를 내려받지 못했습니다 — _errors.txt에 기록됨',
    noConvos: '대화를 찾을 수 없습니다. {0}에 로그인되어 있나요?',
    allFailed: '모든 대화 내려받기에 실패했습니다. 로그를 확인하세요.',
    signInHint: '다른 탭에서 {0}을 열어 로그인 상태를 확인한 후 다시 시도하세요.',
    bannerFrom: '{0}에서 오셨습니다. {1} 해당 대화는 확장 프로그램 팝업에서 하나씩 내보내세요.',
    findingN: '{0}개 발견…',
    nbGemini: 'Google은 대화 목록 엔드포인트를 공개하지 않습니다. Gemini 전체 보관에는 Google Takeout(Gemini 앱 데이터 다운로드)을 이용하세요.',
    nbGrok: 'x.AI는 대화 목록 엔드포인트를 공개하지 않습니다.',
    nbDeepseek: 'DeepSeek은 대화 목록 엔드포인트를 공개하지 않습니다.',
    nbCopilot: 'Microsoft는 일반 사용자용 Copilot 대화 목록 엔드포인트를 공개하지 않습니다.',
    nbMistral: 'Mistral에는 대화 내보내기 API가 전혀 없습니다.'
  },

  'pt-BR': {
    _name: 'Português (Brasil)',
    currentTab: 'Aba atual:', checking: 'verificando…', unknownPage: 'página desconhecida',
    includeLegend: 'Incluir', optBranches: 'Respostas descartadas (editadas ou regeradas)',
    branchesFastOnly: 'Somente Claude e ChatGPT',
    saveAs: 'Salvar como', fmtMd: 'Markdown (.md)', fmtTxt: 'Texto simples (.txt)',
    exportChat: 'Exportar conversa', exporting: 'Exportando…', backupAll: 'Fazer backup de TODAS as conversas…',
    hintFast: 'Lê a transcrição completa direto do {0} — sem rolagem, sem perder nada.',
    hintScroll: 'Rola a página para carregar todo o histórico. Mantenha este popup aberto: clicar na página o fecha e cancela a exportação.',
    why: 'por quê?', hideDetails: 'ocultar detalhes',
    noDetails: 'Nenhum detalhe registrado ainda — execute uma exportação primeiro.',
    pickFormat: 'Escolha pelo menos um formato.',
    injecting: 'Conectando ao {0}…',
    readApi: 'Lidas {0} mensagens da transcrição do próprio site em {1}s — completo, sem rolagem.',
    readDom: 'Lidas {0} mensagens por rolagem em {1}s ({2} passagens).',
    domWarn: 'Atenção: foi usado o método alternativo de leitura da página, que pode perder mensagens em páginas virtualizadas. Clique em "por quê?" abaixo.',
    savedFile: '{0} salvo', done: 'Concluído.', failed: 'Falhou: {0}',
    reloadHint: 'Recarregue a aba da conversa após instalar a extensão e tente novamente.',
    noTab: 'Nenhuma aba ativa.',
    openChat: 'Abra uma conversa em uma aba normal primeiro.',
    nothingReturned: 'A página não retornou nada. Recarregue a aba e tente novamente.',
    noMessagesHelp: 'Abra uma conversa (não a tela inicial nem o histórico), confirme que está conectado e tente novamente.',
    extractFailed: 'Falha na extração.', noMessages: 'Não foi possível ler nenhuma mensagem.',
    askingSite: 'Solicitando a transcrição completa ao site…',
    apiUnavailable: 'API indisponível — voltando a rolar a página…',
    scrollingConv: 'Rolando a conversa ({0} visíveis)…',
    virtualised: 'Lista virtualizada — percorrendo em passos menores…',
    sweeping: 'Lendo… {0} mensagens até agora ({1}s)',
    bulkTitle: 'Fazer backup de tudo',
    bulkSub: 'Baixa todas as conversas da sua conta em um único ZIP, com um arquivo por conversa e um índice.',
    account: 'Conta', oneAtATime: 'Compatível, uma conversa por vez',
    oneAtATimeNote: 'Abra a conversa e use {0} no popup. Apenas Claude e ChatGPT publicam um endpoint que lista todas as conversas, que é o necessário para o backup da conta inteira. Para um arquivo completo do Gemini, use o Google Takeout.',
    saveEachAs: 'Salvar cada conversa como', startBackup: 'Iniciar backup', backingUp: 'Fazendo backup…',
    keepTabOpen: 'Mantenha esta aba aberta.',
    keepTabOpenBody: 'Uma conta grande leva alguns minutos — cerca de um segundo por conversa, num ritmo deliberado para não sobrecarregar o site. Você pode usar outras abas enquanto isso. É preciso já estar conectado à conta escolhida, neste mesmo navegador.',
    listing: 'Listando conversas em {0}…', foundConvos: '{0} conversas encontradas.',
    savedProgress: '{0} de {1} salvas…', packaging: 'Empacotando {0} arquivos…',
    savedZip: '{0} salvo ({1} MB, {2} conversas)',
    someFailed: '{0} conversa(s) não puderam ser baixadas — listadas em _errors.txt',
    noConvos: 'Nenhuma conversa encontrada. Você está conectado ao {0}?',
    allFailed: 'Todas as conversas falharam ao baixar. Veja o registro.',
    signInHint: 'Abra {0} em outra aba, confirme que está conectado e tente novamente.',
    bannerFrom: 'Você veio do {0}. {1} Exporte essa conversa uma de cada vez pelo popup da extensão.',
    findingN: '{0} encontradas…',
    nbGemini: 'O Google não publica nenhum endpoint que liste suas conversas. Para um arquivo completo do Gemini, use o Google Takeout (Baixar seus dados dos apps Gemini).',
    nbGrok: 'A x.AI não publica nenhum endpoint que liste suas conversas.',
    nbDeepseek: 'A DeepSeek não publica nenhum endpoint que liste suas conversas.',
    nbCopilot: 'A Microsoft não publica nenhum endpoint que liste suas conversas do Copilot para consumidores.',
    nbMistral: 'A Mistral não oferece nenhuma API de exportação de conversas.'
  },

  'zh-CN': {
    _name: '简体中文',
    currentTab: '当前标签页：', checking: '正在检查…', unknownPage: '未知页面',
    includeLegend: '包含', optBranches: '被舍弃的回复（编辑或重新生成）',
    branchesFastOnly: '仅 Claude 和 ChatGPT',
    saveAs: '保存为', fmtMd: 'Markdown (.md)', fmtTxt: '纯文本 (.txt)',
    exportChat: '导出对话', exporting: '正在导出…', backupAll: '备份全部对话…',
    hintFast: '直接从 {0} 读取完整记录——无需滚动，不会遗漏。',
    hintScroll: '通过滚动页面加载完整历史记录。请保持此弹窗打开：点击页面会关闭弹窗并取消导出。',
    why: '原因', hideDetails: '隐藏详情',
    noDetails: '尚无记录——请先执行一次导出。',
    pickFormat: '请至少选择一种格式。',
    injecting: '正在连接 {0}…',
    readApi: '已在 {1} 秒内从站点自身的记录中读取 {0} 条消息——内容完整，无需滚动。',
    readDom: '已通过滚动在 {1} 秒内读取 {0} 条消息（{2} 轮）。',
    domWarn: '注意：本次使用了页面抓取的备用方式，在虚拟化页面上可能遗漏消息。请点击下方的"原因"查看。',
    savedFile: '已保存 {0}', done: '完成。', failed: '失败：{0}',
    reloadHint: '安装扩展后请重新加载对话标签页，然后重试。',
    noTab: '没有活动标签页。',
    openChat: '请先在普通标签页中打开一个对话。',
    nothingReturned: '页面未返回任何内容。请重新加载标签页后重试。',
    noMessagesHelp: '请打开一个对话（而非首页或历史记录），确认已登录后重试。',
    extractFailed: '提取失败。', noMessages: '无法读取任何消息。',
    askingSite: '正在向站点请求完整记录…',
    apiUnavailable: 'API 不可用——改用滚动页面的方式…',
    scrollingConv: '正在滚动对话（可见 {0} 条）…',
    virtualised: '检测到虚拟列表——改用更小的步长读取…',
    sweeping: '读取中… 目前 {0} 条（{1} 秒）',
    bulkTitle: '备份全部内容',
    bulkSub: '将账户中的所有对话下载为一个 ZIP，每个对话一个文件，并附索引。',
    account: '账户', oneAtATime: '支持，但需逐个对话导出',
    oneAtATimeNote: '打开对话并使用弹窗中的{0}。只有 Claude 和 ChatGPT 公开了可列出全部对话的接口，而整账户备份正需要它。如需完整的 Gemini 存档，请使用 Google Takeout。',
    saveEachAs: '每个对话保存为', startBackup: '开始备份', backingUp: '正在备份…',
    keepTabOpen: '请保持此标签页打开。',
    keepTabOpenBody: '对话较多时需要几分钟——每个对话约一秒，这是有意放慢的节奏，以免给站点造成压力。其间你可以使用其他标签页。你必须已在同一浏览器中登录所选账户。',
    listing: '正在获取 {0} 的对话列表…', foundConvos: '找到 {0} 个对话。',
    savedProgress: '已保存 {0} / {1}…', packaging: '正在打包 {0} 个文件…',
    savedZip: '已保存 {0}（{1} MB，{2} 个对话）',
    someFailed: '{0} 个对话未能下载——已记录在 _errors.txt 中',
    noConvos: '未找到对话。你已登录 {0} 了吗？',
    allFailed: '所有对话都下载失败。请查看日志。',
    signInHint: '在另一个标签页中打开 {0}，确认已登录后重试。',
    bannerFrom: '你从 {0} 过来。{1} 请改用扩展弹窗逐个导出该对话。',
    findingN: '已找到 {0} 个…',
    nbGemini: 'Google 未公开可列出你的对话的接口。如需完整的 Gemini 存档，请使用 Google Takeout（下载你的 Gemini 应用数据）。',
    nbGrok: 'x.AI 未公开可列出你的对话的接口。',
    nbDeepseek: 'DeepSeek 未公开可列出你的对话的接口。',
    nbCopilot: 'Microsoft 未公开可列出个人版 Copilot 对话的接口。',
    nbMistral: 'Mistral 完全没有提供对话导出 API。'
  },

  de: {
    _name: 'Deutsch',
    currentTab: 'Aktueller Tab:', checking: 'wird geprüft…', unknownPage: 'unbekannte Seite',
    includeLegend: 'Einschließen', optBranches: 'Verworfene Antworten (bearbeitet oder neu erzeugt)',
    branchesFastOnly: 'Nur Claude und ChatGPT',
    saveAs: 'Speichern als', fmtMd: 'Markdown (.md)', fmtTxt: 'Nur Text (.txt)',
    exportChat: 'Chat exportieren', exporting: 'Wird exportiert…', backupAll: 'ALLE Chats sichern…',
    hintFast: 'Liest das vollständige Protokoll direkt von {0} — ohne Scrollen, nichts geht verloren.',
    hintScroll: 'Scrollt die Seite, um den gesamten Verlauf zu laden. Lassen Sie dieses Fenster offen: Ein Klick auf die Seite schließt es und bricht den Export ab.',
    why: 'warum?', hideDetails: 'Details ausblenden',
    noDetails: 'Noch keine Details — führen Sie zuerst einen Export aus.',
    pickFormat: 'Wählen Sie mindestens ein Format.',
    injecting: 'Verbindung zu {0}…',
    readApi: '{0} Nachrichten in {1}s direkt aus dem Protokoll der Website gelesen — vollständig, ohne Scrollen.',
    readDom: '{0} Nachrichten durch Scrollen in {1}s gelesen ({2} Durchläufe).',
    domWarn: 'Hinweis: Es wurde das Auslesen der Seite als Ausweichlösung verwendet; auf virtualisierten Seiten können dabei Nachrichten fehlen. Klicken Sie unten auf „warum?“.',
    savedFile: '{0} gespeichert', done: 'Fertig.', failed: 'Fehlgeschlagen: {0}',
    reloadHint: 'Laden Sie den Chat-Tab nach der Installation neu und versuchen Sie es erneut.',
    noTab: 'Kein aktiver Tab.',
    openChat: 'Öffnen Sie zuerst eine Unterhaltung in einem normalen Tab.',
    nothingReturned: 'Die Seite hat nichts zurückgegeben. Laden Sie den Tab neu und versuchen Sie es erneut.',
    noMessagesHelp: 'Öffnen Sie eine Unterhaltung (nicht die Startseite oder den Verlauf), prüfen Sie die Anmeldung und versuchen Sie es erneut.',
    extractFailed: 'Extraktion fehlgeschlagen.', noMessages: 'Es konnten keine Nachrichten gelesen werden.',
    askingSite: 'Vollständiges Protokoll wird bei der Website angefragt…',
    apiUnavailable: 'API nicht verfügbar — es wird auf Scrollen umgestellt…',
    scrollingConv: 'Unterhaltung wird gescrollt ({0} sichtbar)…',
    virtualised: 'Virtualisierte Liste — es wird in kleineren Schritten gelesen…',
    sweeping: 'Wird gelesen… bisher {0} Nachrichten ({1}s)',
    bulkTitle: 'Alles sichern',
    bulkSub: 'Lädt alle Unterhaltungen Ihres Kontos als ein ZIP herunter, mit einer Datei pro Chat und einem Index.',
    account: 'Konto', oneAtATime: 'Unterstützt, ein Chat nach dem anderen',
    oneAtATimeNote: 'Öffnen Sie die Unterhaltung und verwenden Sie {0} im Fenster der Erweiterung. Nur Claude und ChatGPT bieten einen Endpunkt, der alle Unterhaltungen auflistet — und genau den braucht eine Sicherung des gesamten Kontos. Für ein vollständiges Gemini-Archiv nutzen Sie Google Takeout.',
    saveEachAs: 'Jeden Chat speichern als', startBackup: 'Sicherung starten', backingUp: 'Wird gesichert…',
    keepTabOpen: 'Lassen Sie diesen Tab geöffnet.',
    keepTabOpenBody: 'Ein großes Konto dauert einige Minuten — etwa eine Sekunde pro Unterhaltung, bewusst langsam, um die Website nicht zu belasten. Andere Tabs können Sie währenddessen nutzen. Sie müssen im selben Browser bereits beim gewählten Konto angemeldet sein.',
    listing: 'Unterhaltungen auf {0} werden aufgelistet…', foundConvos: '{0} Unterhaltungen gefunden.',
    savedProgress: '{0} von {1} gespeichert…', packaging: '{0} Dateien werden gepackt…',
    savedZip: '{0} gespeichert ({1} MB, {2} Unterhaltungen)',
    someFailed: '{0} Unterhaltung(en) konnten nicht geladen werden — siehe _errors.txt',
    noConvos: 'Keine Unterhaltungen gefunden. Sind Sie bei {0} angemeldet?',
    allFailed: 'Alle Unterhaltungen konnten nicht geladen werden. Siehe Protokoll.',
    signInHint: 'Öffnen Sie {0} in einem anderen Tab, prüfen Sie die Anmeldung und versuchen Sie es erneut.',
    bannerFrom: 'Sie kommen von {0}. {1} Exportieren Sie diese Unterhaltung stattdessen einzeln über das Fenster der Erweiterung.',
    findingN: '{0} gefunden…',
    nbGemini: 'Google bietet keinen Endpunkt, der Ihre Unterhaltungen auflistet. Für ein vollständiges Gemini-Archiv nutzen Sie Google Takeout (Ihre Gemini-App-Daten herunterladen).',
    nbGrok: 'x.AI bietet keinen Endpunkt, der Ihre Unterhaltungen auflistet.',
    nbDeepseek: 'DeepSeek bietet keinen Endpunkt, der Ihre Unterhaltungen auflistet.',
    nbCopilot: 'Microsoft bietet keinen Endpunkt, der Ihre Copilot-Chats für Privatnutzer auflistet.',
    nbMistral: 'Mistral bietet überhaupt keine API zum Exportieren von Unterhaltungen.'
  },

  it: {
    _name: 'Italiano',
    currentTab: 'Scheda corrente:', checking: 'verifica…', unknownPage: 'pagina sconosciuta',
    includeLegend: 'Includi', optBranches: 'Risposte scartate (modificate o rigenerate)',
    branchesFastOnly: 'Solo Claude e ChatGPT',
    saveAs: 'Salva come', fmtMd: 'Markdown (.md)', fmtTxt: 'Testo semplice (.txt)',
    exportChat: 'Esporta conversazione', exporting: 'Esportazione…', backupAll: 'Esegui il backup di TUTTE le conversazioni…',
    hintFast: 'Legge la trascrizione completa direttamente da {0} — senza scorrimento, senza perdere nulla.',
    hintScroll: "Scorre la pagina per caricare l'intera cronologia. Tieni aperta questa finestra: facendo clic sulla pagina si chiude e l'esportazione viene annullata.",
    why: 'perché?', hideDetails: 'nascondi dettagli',
    noDetails: "Nessun dettaglio registrato — esegui prima un'esportazione.",
    pickFormat: 'Scegli almeno un formato.',
    injecting: 'Connessione a {0}…',
    readApi: 'Lette {0} messaggi dalla trascrizione del sito in {1}s — completa, senza scorrimento.',
    readDom: 'Letti {0} messaggi scorrendo in {1}s ({2} passaggi).',
    domWarn: 'Attenzione: è stata usata la lettura della pagina come ripiego, che su pagine virtualizzate può perdere messaggi. Fai clic su «perché?» qui sotto.',
    savedFile: '{0} salvato', done: 'Completato.', failed: 'Non riuscito: {0}',
    reloadHint: "Ricarica la scheda della conversazione dopo aver installato l'estensione, poi riprova.",
    noTab: 'Nessuna scheda attiva.',
    openChat: 'Apri prima una conversazione in una scheda normale.',
    nothingReturned: 'La pagina non ha restituito nulla. Ricarica la scheda e riprova.',
    noMessagesHelp: 'Apri una conversazione (non la schermata iniziale o la cronologia), verifica di aver effettuato l’accesso e riprova.',
    extractFailed: 'Estrazione non riuscita.', noMessages: 'Non è stato possibile leggere alcun messaggio.',
    askingSite: 'Richiesta della trascrizione completa al sito…',
    apiUnavailable: 'API non disponibile — si torna allo scorrimento della pagina…',
    scrollingConv: 'Scorrimento della conversazione ({0} visibili)…',
    virtualised: 'Elenco virtualizzato — lettura a passi più brevi…',
    sweeping: 'Lettura… {0} messaggi finora ({1}s)',
    bulkTitle: 'Esegui il backup di tutto',
    bulkSub: 'Scarica tutte le conversazioni del tuo account in un unico ZIP, con un file per conversazione e un indice.',
    account: 'Account', oneAtATime: 'Supportato, una conversazione alla volta',
    oneAtATimeNote: "Apri la conversazione e usa {0} nella finestra dell'estensione. Solo Claude e ChatGPT pubblicano un endpoint che elenca tutte le conversazioni, necessario per il backup dell'intero account. Per un archivio Gemini completo, usa Google Takeout.",
    saveEachAs: 'Salva ogni conversazione come', startBackup: 'Avvia backup', backingUp: 'Backup in corso…',
    keepTabOpen: 'Tieni aperta questa scheda.',
    keepTabOpenBody: "Un account voluminoso richiede qualche minuto — circa un secondo per conversazione, con un ritmo volutamente moderato per non sovraccaricare il sito. Nel frattempo puoi usare altre schede. Devi già aver effettuato l'accesso all'account scelto, in questo stesso browser.",
    listing: 'Elenco delle conversazioni su {0}…', foundConvos: '{0} conversazioni trovate.',
    savedProgress: '{0} di {1} salvate…', packaging: 'Creazione dell’archivio con {0} file…',
    savedZip: '{0} salvato ({1} MB, {2} conversazioni)',
    someFailed: '{0} conversazione/i non scaricate — elencate in _errors.txt',
    noConvos: 'Nessuna conversazione trovata. Hai effettuato l’accesso a {0}?',
    allFailed: 'Il download di tutte le conversazioni non è riuscito. Consulta il registro.',
    signInHint: 'Apri {0} in un’altra scheda, verifica di aver effettuato l’accesso e riprova.',
    bannerFrom: "Provieni da {0}. {1} Esporta quella conversazione una alla volta dalla finestra dell'estensione.",
    findingN: '{0} trovate…',
    nbGemini: 'Google non pubblica alcun endpoint che elenchi le tue conversazioni. Per un archivio Gemini completo usa Google Takeout (Scarica i dati delle app Gemini).',
    nbGrok: 'x.AI non pubblica alcun endpoint che elenchi le tue conversazioni.',
    nbDeepseek: 'DeepSeek non pubblica alcun endpoint che elenchi le tue conversazioni.',
    nbCopilot: 'Microsoft non pubblica alcun endpoint che elenchi le tue conversazioni Copilot per utenti privati.',
    nbMistral: 'Mistral non offre alcuna API di esportazione delle conversazioni.'
  },

  es: {
    _name: 'Español',
    currentTab: 'Pestaña actual:', checking: 'comprobando…', unknownPage: 'página desconocida',
    includeLegend: 'Incluir', optBranches: 'Respuestas descartadas (editadas o regeneradas)',
    branchesFastOnly: 'Solo Claude y ChatGPT',
    saveAs: 'Guardar como', fmtMd: 'Markdown (.md)', fmtTxt: 'Texto sin formato (.txt)',
    exportChat: 'Exportar conversación', exporting: 'Exportando…', backupAll: 'Copia de seguridad de TODAS las conversaciones…',
    hintFast: 'Lee la transcripción completa directamente de {0}: sin desplazamiento y sin perder nada.',
    hintScroll: 'Desplaza la página para cargar todo el historial. Mantén esta ventana abierta: al hacer clic en la página se cierra y se cancela la exportación.',
    why: '¿por qué?', hideDetails: 'ocultar detalles',
    noDetails: 'Todavía no hay detalles: ejecuta primero una exportación.',
    pickFormat: 'Elige al menos un formato.',
    injecting: 'Conectando con {0}…',
    readApi: 'Se leyeron {0} mensajes de la transcripción del propio sitio en {1} s: completo y sin desplazamiento.',
    readDom: 'Se leyeron {0} mensajes mediante desplazamiento en {1} s ({2} pasadas).',
    domWarn: 'Aviso: se usó la lectura de la página como alternativa, que puede omitir mensajes en páginas virtualizadas. Haz clic en «¿por qué?» abajo.',
    savedFile: '{0} guardado', done: 'Listo.', failed: 'Error: {0}',
    reloadHint: 'Recarga la pestaña de la conversación tras instalar la extensión y vuelve a intentarlo.',
    noTab: 'No hay ninguna pestaña activa.',
    openChat: 'Abre primero una conversación en una pestaña normal.',
    nothingReturned: 'La página no devolvió nada. Recarga la pestaña e inténtalo de nuevo.',
    noMessagesHelp: 'Abre una conversación (no la pantalla de inicio ni el historial), comprueba que has iniciado sesión y vuelve a intentarlo.',
    extractFailed: 'Error al extraer.', noMessages: 'No se pudo leer ningún mensaje.',
    askingSite: 'Solicitando la transcripción completa al sitio…',
    apiUnavailable: 'API no disponible: se vuelve al desplazamiento de la página…',
    scrollingConv: 'Desplazando la conversación ({0} visibles)…',
    virtualised: 'Lista virtualizada: se recorre en pasos más pequeños…',
    sweeping: 'Leyendo… {0} mensajes hasta ahora ({1} s)',
    bulkTitle: 'Hacer copia de todo',
    bulkSub: 'Descarga todas las conversaciones de tu cuenta en un solo ZIP, con un archivo por conversación y un índice.',
    account: 'Cuenta', oneAtATime: 'Compatible, de una conversación en una',
    oneAtATimeNote: 'Abre la conversación y usa {0} en la ventana de la extensión. Solo Claude y ChatGPT publican un punto de acceso que enumere todas las conversaciones, que es lo que necesita una copia de la cuenta completa. Para un archivo completo de Gemini, usa Google Takeout.',
    saveEachAs: 'Guardar cada conversación como', startBackup: 'Iniciar copia', backingUp: 'Creando copia…',
    keepTabOpen: 'Mantén esta pestaña abierta.',
    keepTabOpenBody: 'Una cuenta grande tarda unos minutos: alrededor de un segundo por conversación, a un ritmo deliberado para no saturar el sitio. Mientras tanto puedes usar otras pestañas. Debes haber iniciado sesión en la cuenta elegida, en este mismo navegador.',
    listing: 'Obteniendo las conversaciones de {0}…', foundConvos: 'Se encontraron {0} conversaciones.',
    savedProgress: '{0} de {1} guardadas…', packaging: 'Empaquetando {0} archivos…',
    savedZip: '{0} guardado ({1} MB, {2} conversaciones)',
    someFailed: 'No se pudieron descargar {0} conversación(es): se indican en _errors.txt',
    noConvos: 'No se encontraron conversaciones. ¿Has iniciado sesión en {0}?',
    allFailed: 'Falló la descarga de todas las conversaciones. Consulta el registro.',
    signInHint: 'Abre {0} en otra pestaña, comprueba que has iniciado sesión y vuelve a intentarlo.',
    bannerFrom: 'Vienes de {0}. {1} Exporta esa conversación de una en una desde la ventana de la extensión.',
    findingN: '{0} encontradas…',
    nbGemini: 'Google no publica ningún punto de acceso que enumere tus conversaciones. Para un archivo completo de Gemini usa Google Takeout (Descargar los datos de tus aplicaciones Gemini).',
    nbGrok: 'x.AI no publica ningún punto de acceso que enumere tus conversaciones.',
    nbDeepseek: 'DeepSeek no publica ningún punto de acceso que enumere tus conversaciones.',
    nbCopilot: 'Microsoft no publica ningún punto de acceso que enumere tus conversaciones de Copilot para consumidores.',
    nbMistral: 'Mistral no ofrece ninguna API para exportar conversaciones.'
  }

};

/* ---------------------------------------------------------------- runtime */

const I18N_FALLBACK = 'en';
const LANG_KEY = 'tesserae.lang';

/* Map Chrome's UI language ("ja", "pt-BR", "en-GB") onto what we ship: exact
   region if we have it, then the bare language, then English. */
function detectLocale() {
  let raw = '';
  try { raw = (chrome.i18n && chrome.i18n.getUILanguage && chrome.i18n.getUILanguage()) || ''; } catch (e) {}
  if (!raw) raw = (navigator.language || '');
  if (!raw) return I18N_FALLBACK;
  if (I18N[raw]) return raw;
  const lower = raw.toLowerCase();
  for (const key of Object.keys(I18N)) if (key.toLowerCase() === lower) return key;
  const base = lower.split('-')[0];
  if (base === 'pt') return 'pt-BR';
  if (base === 'zh') return 'zh-CN';
  if (I18N[base]) return base;
  return I18N_FALLBACK;
}

function storedLang() {
  try { return localStorage.getItem(LANG_KEY) || 'auto'; } catch (e) { return 'auto'; }
}
function setStoredLang(v) {
  try { v === 'auto' ? localStorage.removeItem(LANG_KEY) : localStorage.setItem(LANG_KEY, v); } catch (e) {}
}
function activeLocale() {
  const s = storedLang();
  return (s !== 'auto' && I18N[s]) ? s : detectLocale();
}

/* t('key', a, b). Falls back to English, then to the key, so a gap shows
   readable text instead of an empty element. */
function t(key) {
  const loc = activeLocale();
  const s = (I18N[loc] && I18N[loc][key]) || I18N[I18N_FALLBACK][key] || key;
  const args = Array.prototype.slice.call(arguments, 1);
  return String(s).replace(/\{(\d+)\}/g, (m, i) => (args[i] !== undefined ? args[i] : m));
}

/* Apply translations to any element carrying data-i18n or data-i18n-html. */
function applyI18n(root) {
  const scope = root || document;
  for (const el of scope.querySelectorAll('[data-i18n]')) el.textContent = t(el.getAttribute('data-i18n'));
  for (const el of scope.querySelectorAll('[data-i18n-html]')) el.innerHTML = t(el.getAttribute('data-i18n-html'));
  document.documentElement.lang = activeLocale();
}

/* Fill a <select> with the shipped languages plus the automatic option. */
function buildLangSelect(sel, onChange) {
  sel.innerHTML = '';
  const auto = document.createElement('option');
  auto.value = 'auto';
  auto.textContent = t('langAuto');
  sel.appendChild(auto);
  for (const key of Object.keys(I18N)) {
    const o = document.createElement('option');
    o.value = key;
    o.textContent = I18N[key]._name;
    sel.appendChild(o);
  }
  sel.value = storedLang();
  sel.addEventListener('change', () => { setStoredLang(sel.value); if (onChange) onChange(); });
}
