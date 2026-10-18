"""Revisión fotograma a fotograma: saca una hoja con el fotograma de cada palabra clave (o cada N fotogramas).

Uso:   python revisa.py salida/video.mp4 [cues.json] [palabras,separadas,por,comas]
Sin palabras, saca un fotograma cada medio segundo. Escribe salida/revision-1.jpg, revision-2.jpg… (24 por hoja).
Necesita ffmpeg en el PATH y Pillow (pip install pillow).
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

video = Path(sys.argv[1])
cues = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8")) if len(sys.argv) > 2 else None
claves = sys.argv[3].split(",") if len(sys.argv) > 3 else []
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)],
                           capture_output=True, text=True).stdout.strip())
if cues and claves:
    marcas = [(p["t"] + 0.1, p["texto"]) for p in cues["palabras"] if p["w"] in claves]
else:
    marcas = [(t / 2, f"{t / 2:.1f} s") for t in range(int(dur * 2))]
tmp = Path(tempfile.mkdtemp())
miniaturas = []
for i, (t, etiqueta) in enumerate(marcas):
    f = tmp / f"{i:04d}.png"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", f"{t:.3f}", "-i", str(video), "-frames:v", "1",
                    "-vf", "scale=270:-1", str(f), "-y"])
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
    out = video.parent / f"revision-{h // 24 + 1}.jpg"
    hoja.save(out, quality=85)
    print("hoja:", out)
