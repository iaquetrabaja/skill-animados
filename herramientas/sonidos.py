"""Genera tres efectos originales, sin API ni descargas. Python estándar."""
import argparse
import math
import random
import struct
import wave
from pathlib import Path


def crear(destino):
    destino.mkdir(parents=True, exist_ok=True)
    sr = 24000
    for nombre, dur in [('paso', .22), ('aire', .38), ('logro', .6)]:
        azar = random.Random(614)
        muestras = []
        for i in range(round(sr * dur)):
            t = i / sr
            p = t / dur
            env = min(1, t / .008) * (1 - p) ** 2
            if nombre == 'paso':
                s = math.sin(2 * math.pi * (220 * t - 130 * t * t)) * .6 + (azar.random() * 2 - 1) * .13
            elif nombre == 'aire':
                s = (azar.random() * 2 - 1) * math.sin(math.pi * p) * .45
            else:
                s = sum(math.sin(2 * math.pi * hz * t) for hz in (523.25, 659.25, 783.99)) / 5
            muestras.append(struct.pack('<h', round(max(-1, min(1, s * env)) * 24000)))
        with wave.open(str(destino / f'{nombre}.wav'), 'wb') as w:
            w.setparams((1, 2, sr, 0, 'NONE', 'not compressed'))
            w.writeframes(b''.join(muestras))


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('destino', type=Path, nargs='?', default=Path(__file__).parents[1] / 'plantilla/public/sfx')
    crear(ap.parse_args().destino)
