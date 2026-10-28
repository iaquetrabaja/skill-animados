# Claude y ChatGPT: el mismo proyecto

## Claude Code o Codex con acceso a la carpeta

Abre la carpeta descargada como proyecto y pide:

> Lee AGENTS.md y SKILL.md. Comprueba requisitos y crea `proyectos/mi-primer-video` sin tocar otros trabajos. Primero quiero ver la demo; después, un vídeo sobre [tema] para [público]. Antes de elegir una voz con coste o descargar un modelo, explícame las opciones. Nada de diapositivas: cada frase es algo que pasa, grande y con luz. Enséñame primero el gancho; valida, mide el movimiento y revisa en movimiento antes de darlo por bueno.

No necesitas instalar globalmente la skill para trabajar en esta carpeta. Para descubrimiento automático, copia **todo el repositorio** a `~/.claude/skills/animados` (Claude Code) o `~/.agents/skills/animados` (Codex). `~` representa tu carpeta de usuario. No copies solo SKILL.md: perderías scripts y plantilla. No dupliques una instalación existente.

## ChatGPT/Claude en el navegador

Sube SKILL.md y las referencias 01 a 05. Pide:

> Sigue estas instrucciones para preparar un vídeo sobre [tema]. Dame investigación con fuentes verificables, guion hablado, plan de planos frase por frase y src/video/planos.ts para la plantilla adjunta. No afirmes que has ejecutado ni revisado un render si tu entorno no lo permite. Si faltan archivos, pídeme cuáles necesitas.

Después ejecuta la carpeta local con Codex/Claude Code o manualmente. Un chat web puede generar código; eso no significa que controle tu ordenador ni tenga FFmpeg/GPU disponibles. Las funciones dependen del producto y entorno.

Referencias de compatibilidad: [OpenAI](https://learn.chatgpt.com/docs/build-skills), [Claude Code](https://code.claude.com/docs/en/skills).

## Cambios concretos que sí ayudan

- «En la palabra choca, la luz se parte contra la molécula y salta; no pongas solo una flecha».
- «En el segundo 6 se solapan el título y la captura. Deja la captura en el centro y el título arriba».
- «Conserva mi intro con audio original; añade la narración nueva después».
- «Enséñame primero 5 segundos a baja resolución antes del render completo».
