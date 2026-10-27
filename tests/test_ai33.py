import importlib.util
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('ai33', Path(__file__).parents[1] / 'herramientas/voz_ai33.py')
ai33 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ai33)


class AI33(unittest.TestCase):
    def test_formulario_utf8(self):
        body, content_type = ai33.multipart({'text': '¿Dónde está?', 'voice_id': 'elevenlabs_ejemplo'})
        self.assertIn('¿Dónde está?'.encode(), body)
        self.assertTrue(content_type.startswith('multipart/form-data; boundary='))

    def test_reanuda_sin_duplicar_y_no_envia_clave_al_audio(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / 'voz.mp3'
            with patch.object(ai33, 'api', side_effect=[{'success': True, 'task_id': 'ejemplo'}, {'status': 'failed'}]) as api:
                with self.assertRaises(RuntimeError):
                    ai33.generar('Hola', 'elevenlabs_ejemplo', out, 'clave-ficticia')
                self.assertEqual(api.call_count, 2)
            with patch.object(ai33, 'api', return_value={'status': 'done', 'metadata': {'audio_url': 'https://media.example/voz.mp3'}}) as api, patch.object(ai33.urllib.request, 'urlopen', return_value=io.BytesIO(b'audio-de-prueba')) as download:
                ai33.generar('Hola', 'elevenlabs_ejemplo', out, 'clave-ficticia')
                self.assertEqual(api.call_count, 1)
                self.assertEqual(api.call_args.args[0], '/v1/task/ejemplo')
                self.assertIsNone(download.call_args.args[0].get_header('Xi-api-key'))
                self.assertEqual(out.read_bytes(), b'audio-de-prueba')

    def test_rechaza_sobrescritura_antes_de_cobrar(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / 'voz.mp3'
            out.write_bytes(b'original')
            with patch.object(ai33, 'api') as api:
                with self.assertRaises(ValueError):
                    ai33.generar('Hola', 'elevenlabs_ejemplo', out, 'clave-ficticia')
                api.assert_not_called()

    def test_rechaza_parametros_antes_de_enviar(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(ai33, 'api') as api:
            for text, voice, speed in [('', 'elevenlabs_ejemplo', 1), ('Hola', 'sin-prefijo', 1), ('Hola', 'elevenlabs_ejemplo', 2)]:
                with self.assertRaises(ValueError):
                    ai33.generar(text, voice, Path(tmp) / 'voz.mp3', 'clave-ficticia', speed)
            api.assert_not_called()


if __name__ == '__main__':
    unittest.main()
