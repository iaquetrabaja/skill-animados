"""Voz gratis en tu PC clonando tu voz con Qwen3-TTS con una muestra autorizada obligatoria.

Uso:   python voz_local.py guion.txt voz.wav --muestra mi_voz.wav --texto-muestra "lo que dices en la muestra"
Necesita: pip install qwen-tts soundfile   (PyTorch compatible con tu equipo; memoria y velocidad dependen del modelo y hardware)
La muestra: 10-20 segundos tuyos hablando normal, sin música, y el texto exacto de lo que dices.
En el guion, [ISO 11540|ISO once mil quinientos cuarenta] se lee como lo de la derecha (y el subtítulo enseña lo de la izquierda).
Genera frase a frase y las une con una pausa corta: así la entonación no se pierde en textos largos.
"""
import argparse
import re
from pathlib import Path


ap = argparse.ArgumentParser()
ap.add_argument("guion")
ap.add_argument("salida")
ap.add_argument("--muestra")
ap.add_argument("--texto-muestra", default="")
ap.add_argument("--pausa", type=float, default=0.18, help="segundos de silencio entre frases")
ap.add_argument("--modelo", default="Qwen/Qwen3-TTS-12Hz-1.7B-Base", help="identificador o ruta de modelo local")
a = ap.parse_args()
if not a.muestra or not a.texto_muestra.strip():
    ap.error('Este modelo Base requiere --muestra y --texto-muestra. Usa tu voz o una voz con permiso; no hay voz por defecto.')
if not 0 <= a.pausa <= 2:
    ap.error('--pausa debe estar entre 0 y 2 segundos')
if not Path(a.muestra).is_file():
    ap.error('no existe el archivo de muestra; no se descargará el modelo')

texto = re.sub(r"\[([^|\]]+)\|([^\]]+)\]", r"\2", open(a.guion, encoding="utf-8").read().strip())
frases = [f.strip() for f in re.split(r"(?<=[.?!])\s+", texto) if f.strip()]
if not frases:
    ap.error('el guion está vacío')
import numpy as np
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel
modelo = Qwen3TTSModel.from_pretrained(a.modelo, device_map="cuda:0" if torch.cuda.is_available() else "cpu",
                                       dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32)
trozos, sr = [], 24000
for i, f in enumerate(frases, 1):
    wavs, sr = modelo.generate_voice_clone(text=f, language="Spanish", ref_audio=a.muestra, ref_text=a.texto_muestra)
    trozos.append(np.asarray(wavs[0], dtype=np.float32))
    trozos.append(np.zeros(int(sr * a.pausa), dtype=np.float32))
    print(f"{i}/{len(frases)} {f}")
audio = np.concatenate(trozos)
Path(a.salida).parent.mkdir(parents=True, exist_ok=True)
sf.write(a.salida, audio, sr)
print(f"voz: {a.salida} · {len(audio) / sr:.1f} s")
