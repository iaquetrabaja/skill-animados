"""Regresión sin descargar Whisper: salida exacta, rechazos y estimaciones explícitas."""
import json
import runpy
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).parents[1]


class Alineacion(unittest.TestCase):
    def ejecutar(self, texto, oidas, permitir=False):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp)
            (p / 'guion.txt').write_text(texto, encoding='utf-8')
            palabras = [types.SimpleNamespace(word=w, start=t, end=f) for w, t, f in oidas]
            class Modelo:
                def __init__(self, *a, **k): pass
                def transcribe(self, *a, **k):
                    return [types.SimpleNamespace(words=palabras)], types.SimpleNamespace(duration=3)
            fake = types.SimpleNamespace(WhisperModel=Modelo)
            argv = ['palabras.py', 'no-se-abre.wav', str(p / 'cues.json'), '--guion', str(p / 'guion.txt')]
            if permitir:
                argv.append('--permitir-estimados')
            sys.path.insert(0, str(ROOT / 'herramientas'))
            try:
                with patch.dict(sys.modules, {'faster_whisper': fake}), patch.object(sys, 'argv', argv):
                    runpy.run_path(str(ROOT / 'herramientas/palabras.py'), run_name='__main__')
                return json.loads((p / 'cues.json').read_text(encoding='utf-8'))
            except SystemExit:
                self.assertFalse((p / 'cues.json').exists(), 'un fallo no debe publicar tiempos engañosos')
                raise
            finally:
                sys.path.pop(0)

    def test_coincidencia(self):
        d = self.ejecutar('Hola mundo', [('Hola', 0, .5), ('mundo', 1, 2)])
        self.assertEqual(d['alineacion']['palabras_interpoladas'], 0)
        self.assertEqual(d['palabras'][1]['t'], 1)

    def test_rechazo_mismatch_y_silencio(self):
        for oidas in ([], [('otra', 0, 1)]):
            with self.assertRaises(SystemExit):
                self.ejecutar('Hola mundo', oidas)

    def test_rechaza_palabras_extra(self):
        with self.assertRaises(SystemExit):
            self.ejecutar('Hola mundo', [('Hola',0,.5),('otro',.5,1),('mundo',1,2)])

    def test_interpolacion_es_explicita(self):
        d = self.ejecutar('Hola bonito mundo', [('Hola', 0, .5), ('mundo', 2, 3)], True)
        self.assertTrue(d['palabras'][1]['estimado'])
        self.assertEqual(d['alineacion']['palabras_interpoladas'], 1)

    def test_texto_hablado_y_visible(self):
        d = self.ejecutar('[IA|inteligencia artificial]', [('inteligencia', 0, 1), ('artificial', 1, 2)])
        self.assertEqual(d['palabras'], [{'w': 'inteligencia', 'texto': 'IA', 't': 0, 'f': 2}])


if __name__ == '__main__':
    unittest.main()
