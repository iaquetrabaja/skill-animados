// Tiempos de cada palabra de la voz (cues.json lo genera herramientas/palabras.py).
import datos from '../public/cues.json';

export type Palabra = {w: string; texto: string; t: number; f: number};
export const PALABRAS: Palabra[] = (datos as {palabras: Palabra[]}).palabras;
export const FPS = 30;

const limpia = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

/** Fotograma en el que se dice `palabra` (la n-ésima vez). Lanza error si no está: así no se cuela un dibujo sin su palabra. */
export const cue = (palabra: string, n = 1): number => {
  const w = limpia(palabra);
  const hits = PALABRAS.filter((p) => p.w === w);
  if (!Number.isInteger(n) || n < 1) throw new Error('La aparición debe ser un entero positivo');
  if (hits.length < n) throw new Error(`La palabra «${palabra}» (vez ${n}) no está en la voz`);
  return Math.round(hits[n - 1].t * FPS);
};

/** Fotograma en el que acaba la n-ésima vez que se dice `palabra`. */
export const fin = (palabra: string, n = 1): number => {
  const w = limpia(palabra);
  const hits = PALABRAS.filter((p) => p.w === w);
  if (!Number.isInteger(n) || n < 1 || hits.length < n) throw new Error(`No existe el final de «${palabra}» (vez ${n})`);
  return Math.round(hits[n - 1].f * FPS);
};
