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

Para empezar uno nuevo sin sobrescribir trabajo:

```bash
python herramientas/animados.py crear mi-video
python herramientas/animados.py instalar proyectos/mi-video/plantilla
python herramientas/animados.py preview proyectos/mi-video/plantilla
```

La carpeta raíz se conserva como plantilla. Los proyectos van en `proyectos/`, excluido de Git; el render de cada uno va a su carpeta `salida/`. Guarda voces, fuentes y permisos en tu propio proyecto, no en el repositorio público. Para actualizar, conserva primero tus proyectos y cambios; no ejecutes un reset destructivo.
