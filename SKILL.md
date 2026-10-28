---
name: animados
description: Produce vídeos verticales animados (Reels, Shorts, TikTok) en los que una voz cuenta algo sorprendente y en pantalla se ve, dibujado en código y moviéndose con cada palabra, lo que dice. Investigación, guion, voz, planos con cámara y luz, subtítulos palabra a palabra, revisión en movimiento y render. Funciona con Claude Code y Codex; en un chat sin ejecución prepara los archivos sin fingir un render.
---

# Animados

Lee `AGENTS.md`. El resultado es un vídeo vertical de 25 a 60 segundos: una voz cuenta algo y en la pantalla **pasa** lo que dice. La cosa de verdad, grande, con luz y volumen, moviéndose todo el rato. Nada de diapositivas con títulos, esquemas quietos o iconos sobre un fondo.

El nivel mínimo es la demo (`plantilla/src/demo/cielo.ts`, `ejemplos/cielo-azul/`). Mírala antes del primer vídeo: `python herramientas/animados.py demo` y la lámina del kit `docs/kit.jpg`.

## Antes de empezar

- Con acceso local: `python herramientas/animados.py doctor`, después `crear <nombre>` e `instalar proyectos/<nombre>/plantilla`.
- Sin acceso local: prepara guion, plan y `planos.ts` y explica cómo ejecutarlos (`referencias/06-asistentes.md`). No digas que has visto o renderizado un vídeo si no has podido.
- No instales modelos grandes ni uses servicios de pago (voz) sin que el usuario lo haya elegido.

## Los pasos

1. **Datos.** Busca la fuente de verdad y apunta cada dato con su URL en `investigacion.md` (`referencias/04-investigacion.md`). Busca lo sorprendente, la regla que rompe, el mecanismo paso a paso, una cifra que se sienta y dos comparaciones con cosas de casa.
2. **Guion.** `referencias/01-guion.md`. Gancho en la primera frase, una idea por frase, cada frase es algo que pasa. La imagen se piensa a la vez que la frase. Escribe `guion.txt`.
3. **Voz.** La del usuario (WAV), AI33 (`referencias/08-ai33.md`) o Qwen local. Nunca se acelera, se ralentiza ni se recorta: si una frase suena mal, se reescribe y se rehace. Después, los tiempos: `python herramientas/palabras.py voz.wav plantilla/public/cues.json --guion guion.txt`.
4. **Plan.** `plan.md` antes de dibujar: los sitios, los planos, qué se ve en cada frase, la palabra donde pasa lo fuerte, adónde va la cámara y cómo se pasa al siguiente. Reglas en `referencias/02-planos.md`.
5. **Dibujar.** Un plano detrás de otro en `plantilla/src/video/planos.ts` con el kit (`referencias/03-dibujar.md`). Primero el gancho: grande y moviéndose desde el fotograma 0.
6. **Revisar en movimiento.** `referencias/05-revisar.md`. Cada vez que cambies algo, mira el fotograma o el tramo. Lo que no has mirado no está revisado.
7. **Render.** `python herramientas/animados.py render proyectos/<nombre>/plantilla`. Al terminar mide el movimiento (`herramientas/movimiento.py`): si más de un 30 % del vídeo está quieto, o el primer segundo, o hay 1,5 s seguidos sin cambios, no pasa. Arréglalo antes de enseñarlo.

## Entrega

El MP4 (1080 × 1920, 30 fps, H.264), el guion, las fuentes y dos líneas para el post (la primera engancha). Di qué has revisado y qué no. No publiques en redes por haberlo producido. No copies material de terceros sin permiso ni presentes una ilustración como si fuera una grabación real.
