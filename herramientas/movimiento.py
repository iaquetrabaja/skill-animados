"""Mide cuánto se mueve un vídeo y dónde se queda quieto. Un vídeo animado que parece una diapositiva no pasa.

Uso:   python herramientas/movimiento.py salida/video.mp4 [--max-quieto 30]
Sale con error si más del --max-quieto % de los fotogramas están casi quietos, si el primer segundo está quieto o si
hay más de 1,5 s seguidos sin cambios. Solo necesita ffmpeg. Es una medida, no un juicio: mira también el vídeo.
"""
import argparse
import re
import subprocess
import sys
from pathlib import Path

UMBRAL = 0.3  # diferencia media de luminancia (0-255) por debajo de la cual un fotograma se da por quieto
FPS_MEDIDA = 30


def diferencias(video: Path):
    """Diferencia media entre cada fotograma y el anterior, a 270 px de ancho para que sea rápido."""
    cmd = ['ffmpeg', '-v', 'error', '-i', str(video), '-vf',
           f'fps={FPS_MEDIDA},scale=270:-1,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-',
           '-an', '-f', 'null', '-']
    out = subprocess.run(cmd, capture_output=True, text=True, check=True).stdout
    return [float(x) for x in re.findall(r'YAVG=([0-9.]+)', out)]


def informe(valores, max_quieto=30.0):
    if not valores:
        return ['no se han podido leer fotogramas'], {}
    quietos = [v < UMBRAL for v in valores]
    pct = 100 * sum(quietos) / len(quietos)
    tramos, inicio = [], None
    for i, q in enumerate(quietos + [False]):
        if q and inicio is None:
            inicio = i
        elif not q and inicio is not None:
            if (i - inicio) / FPS_MEDIDA >= 1.5:
                tramos.append((inicio / FPS_MEDIDA, i / FPS_MEDIDA))
            inicio = None
    primero = sum(valores[:FPS_MEDIDA]) / max(1, min(FPS_MEDIDA, len(valores)))
    datos = {'movimiento': sum(valores) / len(valores), 'quieto_pct': pct, 'primer_segundo': primero, 'tramos': tramos}
    errores = []
    if pct > max_quieto:
        errores.append(f'{pct:.0f} % de fotogramas casi quietos (máximo {max_quieto:.0f} %)')
    if primero < UMBRAL * 2:
        errores.append('el primer segundo está casi quieto: el gancho tiene que moverse desde el fotograma 0')
    for a, b in tramos:
        errores.append(f'quieto de {a:.1f} s a {b:.1f} s')
    return errores, datos


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('video', type=Path)
    ap.add_argument('--max-quieto', type=float, default=30.0)
    a = ap.parse_args()
    if not a.video.is_file():
        ap.error(f'no existe {a.video}')
    errores, d = informe(diferencias(a.video), a.max_quieto)
    if d:
        print(f'Movimiento medio {d["movimiento"]:.2f} · {d["quieto_pct"]:.0f} % quieto · primer segundo {d["primer_segundo"]:.2f}')
    if errores:
        print('NO PASA:\n- ' + '\n- '.join(errores))
        sys.exit(1)
    print('Pasa la comprobación de movimiento. Revisa igualmente el vídeo entero con sonido.')


if __name__ == '__main__':
    main()
