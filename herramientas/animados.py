"""Animados: taller portable. Solo biblioteca estándar; no instala nada al arrancar."""
import argparse
import json
import math
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def validar_cues(datos):
    if not isinstance(datos, dict):
        return ['cues.json debe ser un objeto']
    errores = []
    dur = datos.get('duracion')
    if not isinstance(dur, (float, int)) or isinstance(dur, bool) or not math.isfinite(dur) or dur <= 0:
        return ['duracion debe ser un número finito positivo']
    palabras = datos.get('palabras')
    if not isinstance(palabras, list) or not palabras:
        return ['palabras debe contener al menos una palabra']
    anterior = 0
    for i, p in enumerate(palabras):
        if not isinstance(p, dict):
            errores.append(f'palabra {i}: debe ser un objeto')
            continue
        t, f = p.get('t'), p.get('f')
        if not all(isinstance(v, (float, int)) and not isinstance(v, bool) and math.isfinite(v) for v in (t, f)):
            errores.append(f'palabra {i}: tiempos no válidos')
            continue
        if not (0 <= t < f <= dur + .001) or t < anterior - .001:
            errores.append(f'palabra {i}: tiempos fuera de orden o duración')
        anterior = f
        if not all(isinstance(p.get(k), str) and p[k].strip() for k in ('w', 'texto')):
            errores.append(f'palabra {i}: falta w o texto')
    return errores


def ejecutar(args, cwd):
    subprocess.run([str(x) for x in args], cwd=cwd, check=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    sub = ap.add_subparsers(dest='accion', required=True)
    sub.add_parser('doctor', help='comprueba requisitos sin instalar ni descargar modelos')
    nuevo = sub.add_parser('crear', help='crea una copia aislada de la plantilla')
    nuevo.add_argument('nombre')
    for c in ('instalar', 'validar', 'preview', 'render', 'demo'):
        p = sub.add_parser(c)
        p.add_argument('proyecto', nargs='?', default=str(ROOT / 'plantilla'))
    a = ap.parse_args()
    if a.accion == 'doctor':
        print(f'Python: {sys.version.split()[0]}')
        for tool in ('node', 'npm', 'ffmpeg', 'ffprobe'):
            found = shutil.which(tool)
            print(f'{tool}: {found or "NO ENCONTRADO (reabre la terminal tras instalarlo)"}')
        print('Voz y transcripción opcionales: no se comprueban ni descargan modelos.')
        return
    if a.accion == 'crear':
        if not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,59}', a.nombre):
            ap.error('usa un nombre como mi-primer-video, sin rutas ni espacios')
        destino = ROOT / 'proyectos' / a.nombre
        if destino.exists():
            ap.error('esa carpeta ya existe; elige otro nombre para conservar tu trabajo')
        shutil.copytree(ROOT / 'plantilla', destino / 'plantilla', ignore=shutil.ignore_patterns('node_modules', 'build', '.remotion'))
        for nombre in ('guion.txt', 'investigacion.md', 'plan.md'):
            (destino / nombre).write_text('', encoding='utf-8')
        print('Escribe guion.txt, investigacion.md y plan.md; después la voz, los tiempos y src/video/planos.ts.')
        print(f'Creado: {destino}\nSiguiente: python herramientas/animados.py instalar "{destino / "plantilla"}"')
        return
    proyecto = Path(a.proyecto).resolve()
    if not (proyecto / 'src/Raiz.tsx').is_file():
        ap.error('indica la carpeta plantilla del proyecto')
    if a.accion in ('validar', 'render', 'preview', 'demo'):
        archivo_cues = 'public/cielo/cues.json' if a.accion == 'demo' else 'public/cues.json'
        archivo_voz = 'public/cielo/voz.wav' if a.accion == 'demo' else 'public/voz.wav'
        datos = json.loads((proyecto / archivo_cues).read_text(encoding='utf-8-sig'))
        errores = validar_cues(datos)
        if not (proyecto / archivo_voz).is_file():
            errores.append(f'falta {archivo_voz}')
        if errores:
            ap.exit(1, '\n'.join(errores) + '\n')
        print(f'Cues válidos: {len(datos["palabras"])} palabras / {datos["duracion"]} s', flush=True)
        estimadas = sum(bool(p.get('estimado')) for p in datos['palabras'])
        if estimadas:
            print(f'REVISIÓN NECESARIA: {estimadas} piezas tienen tiempos interpolados.', flush=True)
    npm = shutil.which('npm')
    if not npm:
        ap.exit(1, 'Falta Node.js/npm en PATH. Instala Node.js 22 y reabre la terminal.\n')
    if a.accion == 'instalar':
        ejecutar([npm, 'ci'], proyecto)
    elif a.accion == 'validar':
        ejecutar([npm, 'run', 'check'], proyecto)
    elif a.accion == 'preview':
        ejecutar([npm, 'run', 'studio'], proyecto)
    else:
        ejecutar([npm, 'run', 'check'], proyecto)
        ejecutar([npm, 'run', a.accion], proyecto)
        video = proyecto.parent / 'salida' / ('demo.mp4' if a.accion == 'demo' else 'video.mp4')
        # Un vídeo que no se mueve no se entrega: la medida avisa y el asistente lo arregla antes de enseñarlo.
        r = subprocess.run([sys.executable, str(ROOT / 'herramientas/movimiento.py'), str(video)])
        if r.returncode:
            ap.exit(1, 'El render existe, pero no pasa la comprobación de movimiento. Corrige esos tramos.\n')


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, subprocess.CalledProcessError) as e:
        print(f'No se ha completado: {e}', file=sys.stderr)
        sys.exit(1)
