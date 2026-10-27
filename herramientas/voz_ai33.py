"""Voces AI33/OpenSpeaker por API. La clave solo se lee de AI33_API_KEY.
No incluye credenciales. Generar puede consumir los créditos de tu cuenta.
"""
import argparse
import hashlib
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

BASE = 'https://api.ai33.pro'


def multipart(campos):
    boundary = 'Animados' + uuid.uuid4().hex
    body = bytearray()
    for k, v in campos.items():
        body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode('utf-8'))
    body.extend(f'--{boundary}--\r\n'.encode())
    return bytes(body), 'multipart/form-data; boundary=' + boundary


def api(path, key, campos=None, deadline=None):
    body, tipo = multipart(campos) if campos is not None else (None, None)
    headers = {'xi-api-key': key, 'Accept': 'application/json'}
    if tipo:
        headers['Content-Type'] = tipo
    while True:
        try:
            req = urllib.request.Request(BASE + path, data=body, headers=headers)
            with urllib.request.urlopen(req, timeout=90) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            # Solo reintenta lecturas; repetir una creación ambigua puede duplicar el cargo.
            if campos is None and e.code in (429, 503) and deadline:
                try:
                    wait = max(2, float(e.headers.get('Retry-After', '5')))
                except ValueError:
                    wait = 5
                if time.monotonic() + wait < deadline:
                    time.sleep(wait)
                    continue
            raise RuntimeError(f'AI33 respondió HTTP {e.code}. No se repite la creación automáticamente.') from None
        except urllib.error.URLError:
            raise RuntimeError('No se pudo conectar con AI33. No se repite la creación; comprueba tu panel antes de volver a solicitarla.') from None


def generar(texto, voz, salida, key, velocidad=1, timeout=900, transcripcion=False):
    salida = Path(salida)
    if salida.exists():
        raise ValueError('La salida ya existe. Elige otro nombre para conservarla y evitar un cargo accidental.')
    if not texto.strip() or len(texto) > 1_000_000:
        raise ValueError('El guion está vacío o supera el límite documentado.')
    if not voz.startswith(('elevenlabs_', 'minimax_', 'clone_', 'edge_', 'kokoro_', 'vbee_', 'fishaudio_')):
        raise ValueError('Usa el voice_id completo con prefijo del catálogo v3.')
    if not .5 <= velocidad <= 1.5:
        raise ValueError('La velocidad debe estar entre 0.5 y 1.5.')
    salida.parent.mkdir(parents=True, exist_ok=True)
    estado = salida.with_name(salida.name + '.ai33-task.json')
    fingerprint = hashlib.sha256(f'{voz}\n{velocidad}\n{transcripcion}\n{texto}'.encode()).hexdigest()
    if estado.exists():
        task = json.loads(estado.read_text(encoding='utf-8'))
        if task.get('fingerprint') != fingerprint:
            raise ValueError('Hay otra solicitud guardada para esa salida. Usa un nombre nuevo.')
        task_id = task['task_id']
        print('Reanudando la solicitud guardada, sin crear otra.', flush=True)
    else:
        result = api('/v3/text-to-speech', key, {'text': texto, 'voice_id': voz, 'speed': str(velocidad), 'with_transcript': 'true' if transcripcion else 'false'})
        task_id = result.get('task_id')
        if not result.get('success') or not task_id:
            raise RuntimeError('AI33 no devolvió una tarea válida. Revisa el panel antes de volver a generar.')
        estado.write_text(json.dumps({'task_id': task_id, 'fingerprint': fingerprint}), encoding='utf-8')
        print('Solicitud aceptada. Esperando el audio...', flush=True)
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        result = api('/v1/task/' + urllib.parse.quote(task_id, safe=''), key, deadline=deadline)
        status = result.get('status')
        if status in ('done', 'completed', 'success'):
            metadata = result.get('metadata') or {}
            url = metadata.get('audio_url')
            if not isinstance(url, str) or urllib.parse.urlparse(url).scheme != 'https':
                raise RuntimeError('La tarea terminó sin un audio HTTPS utilizable. Conserva el estado y revisa AI33.')
            # Descarga pública: nunca envía la cabecera xi-api-key a la URL del archivo.
            partial = salida.with_name(salida.name + '.part')
            try:
                request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Referer': 'https://ai33.pro/'})
                with urllib.request.urlopen(request, timeout=90) as r, partial.open('wb') as f:
                    total = 0
                    while chunk := r.read(65536):
                        total += len(chunk)
                        if total > 50 * 1024 * 1024:
                            raise ValueError('El audio supera el límite local de 50 MB.')
                        f.write(chunk)
                if not total:
                    raise RuntimeError('El archivo de audio está vacío.')
                partial.replace(salida)
            finally:
                if partial.exists():
                    partial.unlink()
            salida.with_name(salida.name + '.ai33-result.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
            print(f'Audio descargado: {salida}. Guarda la clave fuera del proyecto; vuelve a generar los cues con este audio.', flush=True)
            return result
        if status in ('failed', 'error', 'cancelled', 'canceled'):
            raise RuntimeError('AI33 no pudo completar la voz. No se creará otra tarea automáticamente.')
        time.sleep(min(5, max(0, deadline - time.monotonic())))
    raise TimeoutError('Tiempo de espera agotado. Ejecuta el mismo comando para reanudar sin generar otra voz.')


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    sub = ap.add_subparsers(dest='accion', required=True)
    voices = sub.add_parser('voces', help='consulta el catálogo de voces disponibles')
    voices.add_argument('--proveedor', default='elevenlabs', choices=['elevenlabs', 'minimax', 'clone', 'edge', 'kokoro', 'vbee', 'fishaudio'])
    voices.add_argument('--idioma', default='Spanish')
    voices.add_argument('--buscar', default='')
    gen = sub.add_parser('generar', help='genera narración; puede consumir créditos')
    gen.add_argument('guion', type=Path)
    gen.add_argument('salida', type=Path)
    gen.add_argument('--voz', required=True)
    gen.add_argument('--velocidad', type=float, default=1)
    gen.add_argument('--transcripcion', action='store_true', help='solicita también la transcripción de AI33; puede consumir créditos y tardar más')
    a = ap.parse_args()
    key = os.environ.get('AI33_API_KEY', '').strip()
    if not key:
        ap.error('Falta AI33_API_KEY. Configúrala en tu entorno; no la escribas en el guion ni en GitHub.')
    if a.accion == 'voces':
        data = api('/v3/voices?' + urllib.parse.urlencode({'provider': a.proveedor, 'language': a.idioma, 'search': a.buscar}), key)
        for item in data.get('data', []):
            print(item.get('voice_id'), '-', item.get('name', item.get('display_name', '')))
    else:
        generar(a.guion.read_text(encoding='utf-8-sig'), a.voz, a.salida, key, a.velocidad, transcripcion=a.transcripcion)


if __name__ == '__main__':
    try:
        main()
    except (ValueError, RuntimeError, TimeoutError, OSError) as e:
        raise SystemExit(str(e))
