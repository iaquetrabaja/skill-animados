import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('taller', Path(__file__).parents[1] / 'herramientas/animados.py')
taller = importlib.util.module_from_spec(spec)
spec.loader.exec_module(taller)


class Cues(unittest.TestCase):
    def datos(self, palabras):
        return {'duracion': 3, 'palabras': palabras}

    def p(self, t=0, f=1):
        return {'w': 'hola', 'texto': 'Hola', 't': t, 'f': f}

    def test_valido(self):
        self.assertEqual([], taller.validar_cues(self.datos([self.p(), self.p(1, 2)])))

    def test_rechaza_solape_y_negativos(self):
        for ps in ([self.p(-1, 1)], [self.p(1, 1)], [self.p(0, 4)], [self.p(), self.p(.5, 2)]):
            self.assertTrue(taller.validar_cues(self.datos(ps)))

    def test_rechaza_no_finitos_vacios_y_tipo(self):
        for datos in ({'duracion': float('nan')}, self.datos([]), self.datos([None]), self.datos([self.p(float('inf'), 2)])):
            self.assertTrue(taller.validar_cues(datos))


if __name__ == '__main__':
    unittest.main()
