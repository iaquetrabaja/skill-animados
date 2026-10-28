// Tu vídeo. Sustituye este plano de ejemplo por los tuyos (lee SKILL.md y referencias/02-planos.md).
// Cada plano: nombre, desde (segundo en que empieza; usa la voz: voz.frase(2).inicio, voz.t('palabra')) y dibuja(g, t).
import * as k from '../motor';
import type {Plano} from '../motor/Pelicula';
import datos from '../../public/cues.json';

export const voz = k.crearVoz(datos);
/** Palabras que se marcan en color en los subtítulos (una por frase como mucho). */
export const CLAVES: string[] = [];

const ejemplo: Plano = {
  nombre: 'ejemplo',
  desde: 0,
  dibuja(g, t) {
    // Una cámara que avanza despacio entre estrellas y un planeta que gira y se acerca.
    const cam = k.mira([0, 0, t * 2], [0, 0, t * 2 + 30]);
    k.espacio(g, '#2a2060');
    k.estrellas(g, cam, null, 1);
    const r = 380 + t * 12;
    k.esfera(g, 540, 1050, r, k.tierra(), {giro: t * 0.3, brilloMar: true});
    k.atmosfera(g, 540, 1050, r, '#6ab8ff');
  },
};

export const PLANOS: Plano[] = [ejemplo];
export const DURACION = voz.duracion + 0.6;
