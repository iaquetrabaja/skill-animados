"""Saca cada palabra de la voz con tiempos estimados y la deja en cues.json para la plantilla de Remotion.

Uso:   python palabras.py voz.wav [salida.json] [--guion guion.txt]
Por defecto escribe ../plantilla/public/cues.json. Necesita: pip install faster-whisper

Con --guion (recomendado), el texto de los subtítulos sale del guion, no de la transcripción. Así «ISO 11540» no se
convierte en «hizo 11 .540». De la transcripción solo se cogen los tiempos: se alinean palabra a palabra, y las palabras
que no casan detienen la salida por defecto. --permitir-estimados permite repartir tiempos y los identifica.
En el guion, [ISO 11540|ISO once mil quinientos cuarenta] alinea con lo que se dice (derecha) y el subtítulo enseña
la izquierda como una sola pieza, del principio al final de lo dicho.
Formato: {"palabras": [{"w": "gancho", "texto": "gancho", "t": 1.84, "f": 1.92}, ...], "duracion": 31.2}
"""
import argparse
import difflib
import json
import re
import sys
import unicodedata
from pathlib import Path
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')


NUM = {"0": "cero", "1": "uno", "2": "dos", "3": "tres", "4": "cuatro", "5": "cinco", "6": "seis", "7": "siete", "8": "ocho",
       "9": "nueve", "10": "diez", "11": "once", "12": "doce", "15": "quince", "20": "veinte", "100": "cien"}


def limpia(w: str) -> str:
    w = unicodedata.normalize("NFKD", w.lower()).encode("ascii", "ignore").decode()
    w = re.sub(r"[^a-z0-9]", "", w)
    return NUM.get(w, w)


ap = argparse.ArgumentParser()
ap.add_argument("voz")
ap.add_argument("salida", nargs="?", default=str(Path(__file__).resolve().parent.parent / "plantilla" / "public" / "cues.json"))
ap.add_argument("--guion")
ap.add_argument("--permitir-estimados", action="store_true", help="permite interpolar palabras no reconocidas; exige revisión manual")
ap.add_argument("--modelo", default="small")
a = ap.parse_args()

from faster_whisper import WhisperModel
modelo = WhisperModel(a.modelo, device="auto", compute_type="int8")
segs, info = modelo.transcribe(a.voz, language="es", word_timestamps=True, vad_filter=False)
oidas = [{"w": limpia(w.word), "texto": w.word.strip(), "t": round(w.start, 3), "f": round(w.end, 3)}
         for s in segs for w in (s.words or []) if limpia(w.word)]
if not oidas:
    raise SystemExit("No se ha reconocido voz. No se generarán tiempos ficticios: revisa el audio.")
estimadas = 0

if a.guion:
    texto = Path(a.guion).read_text(encoding="utf-8")
    escritas = []
    for m in re.finditer(r"\[([^|\]]+)\|([^\]]+)\]([^\s]*)|(\S+)", texto):
        if m.group(4):
            if limpia(m.group(4)):
                escritas.append({"w": limpia(m.group(4)), "texto": m.group(4)})
            continue
        dichas = [t for t in m.group(2).split() if limpia(t)]
        for k, t in enumerate(dichas):  # la primera lleva el texto que se enseña; el resto se funde en ella al final
            escritas.append({"w": limpia(t), "texto": m.group(1) + m.group(3) if k == 0 else "", "pieza": k > 0})
    sm = difflib.SequenceMatcher(a=[x["w"] for x in escritas], b=[x["w"] for x in oidas], autojunk=False)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            escritas[blk.a + k]["t"], escritas[blk.a + k]["f"] = oidas[blk.b + k]["t"], oidas[blk.b + k]["f"]
    # Las que no casan: tiempo repartido entre la anterior y la siguiente que sí lo tienen
    conocidas = [i for i, x in enumerate(escritas) if "t" in x]
    estimadas = len(escritas) - len(conocidas)
    extras = len(oidas) - len(conocidas)
    if extras and not a.permitir_estimados:
        raise SystemExit(f'La transcripción contiene {extras} palabras que no coinciden con el guion. Revisa audio/guion; no se ha escrito la salida.')
    if estimadas and not a.permitir_estimados:
        faltan = ' '.join(x['texto'] or x['w'] for x in escritas if 't' not in x)
        raise SystemExit(f"No coinciden {estimadas}/{len(escritas)} palabras: {faltan}. Revisa guion/audio o usa --permitir-estimados conscientemente. No se ha escrito la salida.")
    for i, x in enumerate(escritas):
        if "t" in x:
            continue
        ant = max([j for j in conocidas if j < i], default=None)
        sig = min([j for j in conocidas if j > i], default=None)
        t0 = escritas[ant]["f"] if ant is not None else 0.0
        t1 = escritas[sig]["t"] if sig is not None else info.duration
        hueco = [j for j in range((ant if ant is not None else -1) + 1, sig if sig is not None else len(escritas))]
        paso = (t1 - t0) / max(1, len(hueco))
        pos = hueco.index(i)
        x["t"], x["f"] = round(t0 + pos * paso, 3), round(t0 + (pos + 1) * paso, 3)
        x["estimado"] = True
    palabras = []
    for x in escritas:
        if x.pop("pieza", False):
            palabras[-1]["f"] = x["f"]
            if x.get('estimado'):
                palabras[-1]['estimado'] = True
        else:
            palabras.append(x)
    sin = len(escritas) - len(conocidas)
    print(f"alineadas {len(conocidas)}/{len(escritas)} palabras del guion ({sin} con tiempo repartido)")
else:
    palabras = oidas

from animados import validar_cues
datos = {"palabras": palabras, "duracion": round(info.duration, 3), "alineacion": {"motor": "faster-whisper", "modelo": a.modelo, "palabras_interpoladas": estimadas, "revision_manual": True}}
errores = validar_cues(datos)
if errores:
    raise SystemExit('Tiempos no utilizables: ' + '; '.join(errores))
Path(a.salida).parent.mkdir(parents=True, exist_ok=True)
Path(a.salida).write_text(json.dumps(datos, ensure_ascii=False, indent=1),
                          encoding="utf-8")
print(f"{len(palabras)} palabras · {info.duration:.1f} s → {a.salida}")
print(" ".join(p["texto"] for p in palabras))
