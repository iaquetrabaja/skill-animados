---
name: animados
description: Hace vídeos cortos explicativos animados (Reels, TikTok, Shorts) sin grabar ni editar. Claude investiga el tema, escribe el guion con cuatro ganchos, genera la voz con IA, sincroniza cada dibujo con su palabra en Remotion, revisa el vídeo fotograma a fotograma y lo entrega con texto del post y portada. Úsala cuando te pidan "un vídeo animado de…", "un reel explicando…", "un vídeo tipo curiosidad" o "hazme un vídeo sin grabarme".
---

# Animados: vídeos que no se graban, se escriben

Un vídeo de estos son unos 1.000-2.000 dibujos (30 por segundo) que cambian en el momento exacto en que la voz dice cada cosa. No se edita en ningún programa: lo escribes en código con Remotion y se renderiza solo.

Trabajas siempre en este orden. No te saltes pasos: el que más se salta la gente es la revisión, y es el que separa un vídeo que se ve de uno que se queda en 300 visualizaciones.

## 0. Antes de empezar

- Lee `referencias/05-taller.md` y prepara la carpeta del vídeo con la plantilla.
- Lee `referencias/gusto.md`: es lo que hace que no parezca hecho con IA.
- Si el usuario tiene un `voz.md` o ejemplos de su voz, úsalos. Si no, pregunta una sola cosa: ¿para quién es el vídeo?

## 1. Investigar (referencias/04-investigacion.md)

- Busca la respuesta real al tema en al menos 3 fuentes, y que una sea primaria: fabricante, norma, estudio o artículo con autor.
- Apunta cada dato con su fuente en `investigacion.md`. Lo que no tenga fuente, no entra en el guion.
- Busca el detalle que nadie cuenta. El vídeo vive de un «no sabía esto».

## 2. Guion y texto (referencias/01-guion-y-texto.md)

- Escribe **4 ganchos distintos** para el primer segundo y elige uno con el usuario o, si no está, el que mejor cumpla la rúbrica.
- Escribe el guion: 70-110 palabras (25-40 s), frases de 4-12 palabras, un dato por frase y un cierre que devuelva al gancho.
- Escribe el texto del post y 3 opciones de portada.

## 3. Voz

- Por defecto, voz local gratis: `python herramientas/voz_local.py guion.txt voz.wav --muestra mi_voz.wav --texto-muestra "lo que dices en la muestra"`, que clona la voz del usuario a partir de 10-20 segundos de muestra (necesita una gráfica NVIDIA para ir rápido).
- Cifras y siglas: en `guion.txt` escribe `[ISO 11540|ISO once mil quinientos cuarenta]`. La voz lee la parte de la derecha y el subtítulo enseña la de la izquierda.
- Si el usuario prefiere ElevenLabs, genera `voz.wav` con su API y su voz. Cuesta céntimos por vídeo.
- Escucha el resultado entero (o léelo transcrito con `palabras.py`). Si una palabra suena rara, reescribe la frase, no la fuerces.

## 4. Palabra a palabra

- `python herramientas/palabras.py voz.wav plantilla/public/cues.json --guion guion.txt` crea `cues.json` con cada palabra y su segundo exacto. Con `--guion`, el texto sale del guion y de la voz solo se cogen los tiempos: así no se cuelan errores de transcripción.
- Haz la **tabla frase → dibujo** (`referencias/02-frase-a-dibujo.md`): para cada frase, qué se ve, qué palabra lo dispara y qué movimiento tiene.

## 5. Animar (referencias/03-movimiento-y-sincro.md)

- Escribe las escenas en `plantilla/src/escenas.tsx`. Cada escena es un componente SVG o React y empieza en `cue("palabra")`, nunca en un segundo puesto a mano.
- Un elemento nuevo como mucho cada 0,5 s. Nada aparece sin moverse; nada se mueve sin motivo.
- Subtítulos de 2-4 palabras con la palabra clave resaltada; ya vienen en la plantilla.

## 6. Revisar fotograma a fotograma

- `npx remotion render src/index.ts Video ../salida/video.mp4` y después `python herramientas/revisa.py salida/video.mp4`, que saca hojas con un fotograma cada medio segundo.
- Mira la hoja y comprueba que:
  - cada dibujo está en su palabra (con 3 fotogramas de margen, no más);
  - nada se corta en los bordes;
  - ningún texto choca con los subtítulos;
  - nada parpadea.
- Arregla y vuelve a renderizar. Repite hasta que la hoja esté limpia. No entregues sin haberla mirado.

## 7. Entregar

- `salida/video.mp4` en 1080×1920 a 30 fps, con el texto del post, 3 portadas (`salida/portada-*.png`) y la lista de fuentes.
- Di en una línea qué has revisado y qué no se ha podido comprobar.

## Ejemplos

En `ejemplos/` tienes tres vídeos completos (boli, metro y lata) con su guion, su investigación con fuentes y sus escenas. Léelos antes de animar el primero: es la forma más rápida de ver el nivel.

## Reglas que no se rompen

- Nada inventado: sin fuente, el dato no entra.
- Las marcas y los vídeos de otros se citan; no se copian sus dibujos ni su música.
- Sin emojis en pantalla y sin voces de famosos.
