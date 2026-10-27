"""Revisión fotograma a fotograma: saca una hoja con el fotograma de cada palabra clave (o cada N fotogramas).

Uso:   python revisa.py salida/video.mp4 [cues.json] [palabras,separadas,por,comas]
Sin palabras, saca un fotograma cada medio segundo. Escribe salida/revision-1.jpg, revision-2.jpg… (24 por hoja).
Necesita ffmpeg en el PATH y Pillow (pip install pillow).
"""
import json
import argparse
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

ap = argparse.ArgumentParser(description='Genera hojas de contacto, un muestreo de medio segundo. No evalúa automáticamente el vídeo.')
ap.add_argument('video', type=Path)
ap.add_argument('cues', type=Path, nargs='?')
ap.add_argument('claves', nargs='?', default='')
a = ap.parse_args()
video = a.video
cues = json.loads(a.cues.read_text(encoding='utf-8-sig')) if a.cues else None
claves = a.claves.split(',') if a.claves else []
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)],
                           capture_output=True, text=True, check=True).stdout.strip())
if cues and claves:
    marcas = [(p["t"] + 0.1, p["texto"]) for p in cues["palabras"] if p["w"] in claves]
else:
    marcas = [(t / 2, f"{t / 2:.1f} s") for t in range(int(dur * 2))]
if not marcas:
    ap.error('no hay fotogramas: comprueba duración y palabras clave')
temporales = tempfile.TemporaryDirectory(prefix='animados-review-')
tmp = Path(temporales.name)
miniaturas = []
for i, (t, etiqueta) in enumerate(marcas):
    f = tmp / f"{i:04d}.png"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", f"{t:.3f}", "-i", str(video), "-frames:v", "1",
                    "-vf", "scale=270:-1", str(f), "-y"], check=True)
    if f.exists():
        im = Image.open(f).convert("RGB")
        ImageDraw.Draw(im).rectangle((0, 0, im.width, 22), fill=(0, 0, 0))
        ImageDraw.Draw(im).text((6, 5), f"{t:.2f}s · {etiqueta}", fill=(255, 210, 0))
        miniaturas.append(im)
for h in range(0, len(miniaturas), 24):
    lote = miniaturas[h:h + 24]
    w, ht = lote[0].size
    hoja = Image.new("RGB", (w * 6, ht * ((len(lote) + 5) // 6)), (20, 20, 20))
    for i, im in enumerate(lote):
        hoja.paste(im, ((i % 6) * w, (i // 6) * ht))
    out = video.parent / f"{video.stem}-revision-{h // 24 + 1}.jpg"
    hoja.save(out, quality=85)
    print("hoja:", out)
temporales.cleanup()
print('Las hojas son un muestreo: revisa también las transiciones en movimiento y escucha el audio completo.')
