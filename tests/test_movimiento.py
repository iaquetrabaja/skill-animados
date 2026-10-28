import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('movimiento', Path(__file__).parents[1] / 'herramientas/movimiento.py')
mov = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mov)


class Movimiento(unittest.TestCase):
    def test_pasa_si_se_mueve(self):
        errores, d = mov.informe([2.0] * 300)
        self.assertEqual([], errores)
        self.assertEqual(0, d['quieto_pct'])

    def test_diapositiva_no_pasa(self):
        errores, d = mov.informe([2.0] * 30 + [0.0] * 270)
        self.assertGreater(d['quieto_pct'], 30)
        self.assertTrue(any('quieto de' in e for e in errores))

    def test_primer_segundo_quieto(self):
        errores, _ = mov.informe([0.0] * 30 + [2.0] * 300)
        self.assertTrue(any('primer segundo' in e for e in errores))

    def test_pausa_corta_permitida(self):
        errores, _ = mov.informe([2.0] * 60 + [0.0] * 30 + [2.0] * 200)
        self.assertEqual([], errores)


if __name__ == '__main__':
    unittest.main()
