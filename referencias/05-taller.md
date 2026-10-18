# El taller: cómo se organiza cada vídeo

Cada vídeo, en su carpeta:

```
mi-video/
  investigacion.md     fuentes y datos (paso 1)
  guion.txt            el texto que dice la voz (paso 2)
  post.md              texto del post y portadas (paso 2)
  escenas.md           tabla frase → dibujo (paso 4)
  plantilla/           copia de la plantilla de Remotion
    public/voz.wav     la voz (paso 3)
    public/cues.json   cada palabra con su tiempo (paso 4)
    src/escenas.tsx    los dibujos (paso 5)
  salida/              vídeo, hojas de revisión y portadas (pasos 6 y 7)
```

Para empezar uno nuevo:

```bash
cp -r plantilla mi-video/plantilla
cd mi-video/plantilla && npm install
```

Para ver el vídeo mientras lo haces: `npx remotion studio`. Para renderizarlo: `npx remotion render Video ../salida/video.mp4`.
