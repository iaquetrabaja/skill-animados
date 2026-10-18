"""Voz gratis en tu PC clonando tu voz con Qwen3-TTS (o con una voz por defecto si no le das muestra).

Uso:   python voz_local.py guion.txt voz.wav --muestra mi_voz.wav --texto-muestra "lo que dices en la muestra"
Necesita: pip install qwen-tts soundfile   (y una gráfica NVIDIA con 6 GB o más; sin gráfica va, pero lento)
La muestra: 10-20 segundos tuyos hablando normal, sin música, y el texto exacto de lo que dices.
En el guion, [ISO 11540|ISO once mil quinientos cuarenta] se lee como lo de la derecha (y el subtítulo enseña lo de la izquierda).
Genera frase a frase y las une con una pausa corta: así la entonación no se pierde en textos largos.
"""
import argparse
import re

import numpy as np
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

ap = argparse.ArgumentParser()
ap.add_argument("guion")
ap.add_argument("salida")
ap.add_argument("--muestra")
ap.add_argument("--texto-muestra", default="")
ap.add_argument("--pausa", type=float, default=0.18, help="segundos de silencio entre frases")
a = ap.parse_args()

texto = re.sub(r"\[([^|\]]+)\|([^\]]+)\]", r"\2", open(a.guion, encoding="utf-8").read().strip())
frases = [f.strip() for f in re.split(r"(?<=[.?!])\s+", texto) if f.strip()]
modelo = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base", device_map="cuda:0" if torch.cuda.is_available() else "cpu",
                                       dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32)
trozos, sr = [], 24000
for i, f in enumerate(frases, 1):
    wavs, sr = modelo.generate_voice_clone(text=f, language="Spanish", ref_audio=a.muestra, ref_text=a.texto_muestra)
    trozos.append(np.asarray(wavs[0], dtype=np.float32))
    trozos.append(np.zeros(int(sr * a.pausa), dtype=np.float32))
    print(f"{i}/{len(frases)} {f}")
audio = np.concatenate(trozos)
sf.write(a.salida, audio, sr)
print(f"voz: {a.salida} · {len(audio) / sr:.1f} s")
