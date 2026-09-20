<picture>
  <source media="(prefers-color-scheme: dark)" srcset="banner-dark.svg">
  <img alt="Tesserae Chat Archiver" src="banner-light.svg" width="100%">
</picture>

[English](../README.md) · [日本語](README.ja.md) · [Français](README.fr.md) · [한국어](README.ko.md) · [Português (BR)](README.pt-BR.md) · [简体中文](README.zh-CN.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Español](README.es.md)

> **Esta traducción es solo de referencia.** El [README en inglés](../README.md) es la versión válida.

Extensión de Chrome que exporta conversaciones con IA a Markdown y texto sin formato. Una conversación, o toda la cuenta en un ZIP.

- Transcripciones completas en Claude y ChatGPT, leídas desde el punto de acceso de cada sitio
- Copia de la cuenta entera en un solo ZIP, agrupada por proyecto
- Siete servicios, con detección estructural para el resto
- Markdown y texto sin formato, juntos o por separado
- Exportación opcional de las respuestas editadas o regeneradas
- Interfaz en nueve idiomas

Manifest V3. Sin dependencias, sin compilación, sin servidores y sin telemetría.

## Primeros pasos

1. Descarga el ZIP desde [Releases](../../../releases) y descomprímelo
2. Abre `chrome://extensions` y activa el **modo de desarrollador**
3. Pulsa **Cargar descomprimida** y selecciona la carpeta descomprimida
4. Abre una conversación en un sitio compatible, pulsa la extensión en la barra de herramientas y luego **Exportar conversación**

El archivo aparece en tus descargas. Eso es todo.

No muevas ni borres la carpeta descomprimida: Chrome identifica las extensiones descomprimidas por su ruta. Si clonaste el repositorio, en el paso 3 elige `extension/`.

Los dos formatos vienen marcados. Desmarca uno para obtener solo el otro.

Marca **Respuestas descartadas** para exportar también las ramas editadas o regeneradas. Solo Claude y ChatGPT.

**Toda la cuenta**: pulsa **Copia de seguridad de TODAS las conversaciones**. Se abre una pestaña y se escribe un único ZIP: un archivo por conversación, un índice y, para las conversaciones de un proyecto de Claude, una carpeta con el nombre del proyecto.

Los nombres de archivo empiezan por la fecha. Los títulos repetidos se numeran, nunca se sobrescriben. Las conversaciones fallidas se anotan en `_errors.txt` y no interrumpen el proceso. Las peticiones se envían a razón de una por segundo aproximadamente.

## Motivo

La mayoría de los exportadores desplazan la página y leen el DOM. Claude muestra las conversaciones largas en una lista virtualizada: los mensajes fuera de pantalla se eliminan del DOM y la exportación sale recortada, sin aviso alguno.

Esta extensión lee la transcripción desde el punto de acceso del propio sitio cuando existe, y recurre al desplazamiento cuando no. El archivo exportado indica qué método se usó.

## Compatibilidad

| Sitio | Método | En bloque |
|---|---|---|
| claude.ai | API de transcripción | Sí |
| chatgpt.com | API de transcripción | Sí |
| gemini.google.com | DOM, `<infinite-scroller>` | No |
| grok.com | DOM, `.message-bubble` | No |
| chat.deepseek.com | DOM, `.ds-markdown` + estructural | No |
| copilot.microsoft.com | DOM, `[data-content]` | No |
| chat.mistral.ai | Solo estructural | No |
| Otros | Estructural | No |

La copia de toda la cuenta necesita un punto de acceso que enumere todas las conversaciones. Solo Claude y ChatGPT publican uno. Para un archivo completo de Gemini usa Google Takeout.

## Idiomas

Interfaz disponible en nueve idiomas. Sigue el idioma de Chrome, con un selector al pie de cada página.

## Limitaciones

- Copia en bloque: solo Claude y ChatGPT.
- Los puntos de acceso no están documentados y pueden cambiar sin previo aviso. Si una exportación sale incompleta, pulsa **¿por qué?** en la ventana para ver el diagnóstico.
- Los selectores de Grok, DeepSeek, Copilot y Le Chat proceden de fuentes públicas y no se han verificado en cuentas reales.

## Licencia

MIT. Copyright (c) 2026 Lavelle Hatcher Jr.

Sin afiliación con ninguno de los servicios mencionados arriba, ni respaldo por su parte.
