"""Normaliza una voz o mezcla música con reducción automática bajo la voz.
No sobrescribe la entrada. Requiere FFmpeg, no requiere GPU/modelos.
"""
import argparse
import subprocess
from pathlib import Path


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('voz', type=Path)
    ap.add_argument('salida', type=Path)
    ap.add_argument('--musica', type=Path)
    a = ap.parse_args()
    fuentes = [a.voz] + ([a.musica] if a.musica else [])
    if any(p.resolve() == a.salida.resolve() for p in fuentes):
        ap.error('la salida debe ser un archivo diferente de las entradas')
    if a.salida.suffix.lower() != '.wav':
        ap.error('la salida debe ser WAV para mantener un audio editable')
    if not all(p.is_file() for p in fuentes):
        ap.error('falta un archivo de entrada')
    a.salida.parent.mkdir(parents=True, exist_ok=True)
    cmd = ['ffmpeg', '-v', 'error', '-n', '-i', str(a.voz)]
    if a.musica:
        cmd += ['-stream_loop', '-1', '-i', str(a.musica), '-filter_complex',
                '[0:a]loudnorm=I=-16:TP=-1.5:LRA=11,asplit=2[v][control];'
                '[1:a]volume=0.12[bed];[bed][control]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=350[duck];'
                '[v][duck]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.84[out]', '-map', '[out]']
    else:
        cmd += ['-af', 'loudnorm=I=-16:TP=-1.5:LRA=11']
    cmd += ['-ar', '48000', '-c:a', 'pcm_s16le', str(a.salida)]
    subprocess.run(cmd, check=True)
    print('Audio preparado. Escucha el resultado completo; la mezcla automática no sustituye esa revisión.')


if __name__ == '__main__':
    main()
