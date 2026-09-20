<picture>
  <source media="(prefers-color-scheme: dark)" srcset="banner-dark.svg">
  <img alt="Tesserae Chat Archiver" src="banner-light.svg" width="100%">
</picture>

[English](../README.md) · [日本語](README.ja.md) · [Français](README.fr.md) · [한국어](README.ko.md) · [Português (BR)](README.pt-BR.md) · [简体中文](README.zh-CN.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Español](README.es.md)

> **이 번역은 참고용입니다.** 정식 문서는 [영문 README](../README.md)입니다.

AI 대화를 Markdown과 일반 텍스트로 내보내는 Chrome 확장 프로그램입니다. 대화 하나 또는 계정 전체를 ZIP으로 저장합니다.

- Claude와 ChatGPT는 사이트 자체 엔드포인트에서 전체 기록을 가져옵니다
- 계정 전체를 ZIP 하나로, 프로젝트별로 정리
- 7개 서비스 지원, 그 외에는 구조 기반 인식
- 마크다운과 일반 텍스트, 함께 또는 따로
- 편집·재생성으로 버려진 답변도 선택적으로 내보내기
- 인터페이스 9개 언어

Manifest V3. 의존성, 빌드 단계, 서버, 텔레메트리가 없습니다.

## 시작하기

1. [Releases](../../../releases)에서 ZIP을 내려받아 압축을 풉니다
2. `chrome://extensions`를 열고 **개발자 모드**를 켭니다
3. **압축해제된 확장 프로그램을 로드합니다**를 눌러 압축을 푼 폴더를 선택합니다
4. 지원하는 사이트에서 대화를 열고, 도구 모음의 확장 프로그램을 눌러 **대화 내보내기**를 선택합니다

파일은 다운로드 폴더에 저장됩니다. 이것으로 끝입니다.

Chrome은 경로로 확장 프로그램을 식별하므로 압축을 푼 폴더를 옮기거나 지우지 마세요. 저장소를 복제했다면 3단계에서 `extension/`을 선택합니다.

두 형식 모두 기본으로 선택되어 있습니다. 하나를 해제하면 나머지 하나만 저장됩니다.

**버려진 답변**을 선택하면 편집·재생성으로 버려진 분기도 함께 내보냅니다. Claude와 ChatGPT만 지원합니다.

**계정 전체**: **모든 대화 백업**을 누릅니다. 전용 탭이 열리고 하나의 ZIP으로 저장됩니다. 대화마다 파일 하나, 색인, Claude 프로젝트에 속한 대화는 프로젝트 이름 폴더에 정리됩니다.

파일 이름에는 날짜가 붙고, 제목이 같으면 덮어쓰지 않고 번호가 매겨집니다. 실패한 대화는 `_errors.txt`에 기록되며 나머지는 계속 진행됩니다. 요청은 초당 약 1건 속도입니다.

## 배경

대부분의 내보내기 도구는 페이지를 스크롤해 DOM을 읽습니다. Claude는 긴 대화를 가상 목록으로 렌더링하므로 화면 밖 메시지는 DOM에서 제거되고, 경고 없이 잘린 결과가 나옵니다.

이 확장 프로그램은 가능한 경우 사이트의 기록 엔드포인트에서 읽고, 불가능하면 스크롤로 전환합니다. 어느 방식을 썼는지는 내보낸 파일에 기록됩니다.

## 지원 현황

| 사이트 | 방식 | 일괄 |
|---|---|---|
| claude.ai | 기록 API | 가능 |
| chatgpt.com | 기록 API | 가능 |
| gemini.google.com | DOM, `<infinite-scroller>` | 불가 |
| grok.com | DOM, `.message-bubble` | 불가 |
| chat.deepseek.com | DOM, `.ds-markdown` + 구조 감지 | 불가 |
| copilot.microsoft.com | DOM, `[data-content]` | 불가 |
| chat.mistral.ai | 구조 감지만 | 불가 |
| 그 외 | 구조 감지 | 불가 |

일괄 백업에는 모든 대화를 나열하는 엔드포인트가 필요하며, 이를 공개한 곳은 Claude와 ChatGPT뿐입니다. Gemini 전체 보관은 Google Takeout을 이용하세요.

## 언어

인터페이스는 9개 언어를 지원합니다. Chrome의 표시 언어를 따르며 각 페이지 하단에서 바꿀 수 있습니다.

## 제한 사항

- 일괄 백업은 Claude와 ChatGPT만 지원합니다.
- 사용하는 엔드포인트는 비공개이며 예고 없이 바뀔 수 있습니다. 결과가 부족하면 팝업의 **자세히**에서 진단 내용을 확인하세요.
- Grok, DeepSeek, Copilot, Le Chat의 선택자는 공개 자료를 바탕으로 했으며 실제 계정에서 검증하지 않았습니다.

## 라이선스

MIT. Copyright (c) 2026 Lavelle Hatcher Jr.

위에 언급된 어떤 서비스와도 제휴하거나 승인을 받지 않았습니다.
