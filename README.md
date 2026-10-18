# skill-animados

Una skill para Claude que hace **vídeos cortos explicativos animados** (Reels, TikTok, Shorts) sin grabar ni editar.
Le dices el tema y Claude:

1. **Investiga** y apunta de dónde sale cada dato. Lo que no tiene fuente no entra.
2. **Escribe cuatro ganchos**, elige el mejor y escribe el guion (25-40 segundos).
3. **Pone la voz**, gratis en tu PC y clonando la tuya si le das 15 segundos de muestra.
4. **Saca cada palabra con su segundo exacto** y dibuja cada cosa justo cuando se dice: cuando oyes «gancho», cae el gancho.
5. **Lo revisa entero, fotograma a fotograma**, antes de dártelo.

No hay vídeo grabado: son unos mil dibujos hechos con código (Remotion) que cambian en el momento exacto.

## Instalación

Pega esto en Claude Code:

```
https://github.com/iaquetrabaja/skill-animados

Instala esta skill y prepárame la plantilla para hacer mi primer vídeo.
```

O a mano:

```bash
git clone https://github.com/iaquetrabaja/skill-animados.git ~/.claude/skills/animados
cd ~/.claude/skills/animados/plantilla && npm install
```

## Lo que necesitas

| Para | Qué |
| --- | --- |
| Animar y renderizar | [Node.js](https://nodejs.org) 18 o más |
| Tiempos de cada palabra | Python 3.10 o más y `pip install faster-whisper` |
| Hojas de revisión | `pip install pillow` y [ffmpeg](https://ffmpeg.org) |
| Voz gratis en tu PC (opcional) | `pip install qwen-tts soundfile` y una gráfica NVIDIA de 6 GB o más |

Si no quieres voz local, vale cualquier `voz.wav`: grabada por ti o de ElevenLabs.

## Pruébalo en un minuto

La plantilla trae un ejemplo montado («¿Por qué el fondo de una lata está hundido?») con el audio en silencio:

```bash
cd plantilla
npx remotion studio
```

Para tu primer vídeo, pídeselo a Claude: «hazme un vídeo animado de por qué los teclados no van en orden alfabético».

## Qué hay dentro

| Carpeta | Qué es |
| --- | --- |
| `SKILL.md` | El método, paso a paso. Es lo que lee Claude. |
| `referencias/` | Las reglas de un editor: guion y ganchos, de la frase al dibujo, movimiento y sincronización, investigación, cómo organizar cada vídeo y el gusto para que no parezca hecho con IA. |
| `herramientas/` | `voz_local.py` (voz clonada gratis), `palabras.py` (cada palabra con su tiempo) y `revisa.py` (hojas para revisar fotograma a fotograma). |
| `plantilla/` | El proyecto de Remotion: fondo, subtítulos con la palabra clave resaltada, transiciones sin huecos y la voz. |
| `ejemplos/` | Tres vídeos completos con guion, fuentes y escenas: el agujero del boli, el gancho del metro y el fondo de la lata. |

## Licencias

El código y los textos de este repositorio son MIT. [Remotion](https://www.remotion.dev/license) es gratis para personas y empresas de hasta 3 trabajadores; por encima piden licencia de empresa.

Hecho por [IA que trabaja](https://iaquetrabaja.com).
