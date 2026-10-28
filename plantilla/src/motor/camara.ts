// Un mundo 3D dibujado en 2D: cada cosa tiene su sitio [x, y, z] y la cámara la proyecta.
import {V3, W, H, mezV, suave, tramo} from './base';

export type Camara = {pos: V3; mira: V3; f: number; der: V3; arriba: V3; delante: V3};
export type Punto = {x: number; y: number; z: number; s: number};

const resta = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cruz = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const punto = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** Cámara en `pos` que mira a `mira`. `f` es la focal en píxeles (más alto = más zoom). `giro` inclina el horizonte (radianes). */
export function mira(pos: V3, objetivo: V3, f = 1400, giro = 0): Camara {
  const delante = unit(resta(objetivo, pos));
  let der = unit(cruz(delante, [0, 1, 0]));
  let arriba = cruz(der, delante);
  if (giro) {
    const c = Math.cos(giro), s = Math.sin(giro);
    [der, arriba] = [unit([der[0] * c + arriba[0] * s, der[1] * c + arriba[1] * s, der[2] * c + arriba[2] * s]),
      unit([arriba[0] * c - der[0] * s, arriba[1] * c - der[1] * s, arriba[2] * c - der[2] * s])];
  }
  return {pos, mira: objetivo, f, der, arriba, delante};
}

/** Punto del mundo → pantalla. `s` multiplica un radio del mundo para pasarlo a píxeles. null si queda detrás. */
export function proyecta(cam: Camara, p: V3): Punto | null {
  const d = resta(p, cam.pos);
  const z = punto(d, cam.delante);
  if (z < 0.05) return null;
  const s = cam.f / z;
  return {x: W / 2 + punto(d, cam.der) * s, y: H / 2 - punto(d, cam.arriba) * s, z, s};
}

/** Cámara que pasa por claves de tiempo sin tirones: ruta(t, [[0, {pos, mira}], [2.5, {pos, mira, f}]]). */
export function ruta(t: number, claves: [number, {pos: V3; mira: V3; f?: number; giro?: number}][]): Camara {
  let a = claves[0], b = claves[0];
  for (let i = 1; i < claves.length; i++) {
    if (t >= claves[i - 1][0]) {
      a = claves[i - 1];
      b = claves[i];
    }
  }
  const u = t >= claves[claves.length - 1][0] ? 1 : suave(tramo(t, a[0], b[0]));
  const A = a[1], B = b[1];
  return mira(mezV(A.pos, B.pos, u), mezV(A.mira, B.mira, u), (A.f ?? 1400) + ((B.f ?? 1400) - (A.f ?? 1400)) * u,
    (A.giro ?? 0) + ((B.giro ?? 0) - (A.giro ?? 0)) * u);
}

/** Un punto alrededor del origen: para girar alrededor de algo. */
export const orbita = (angulo: number, distancia: number, altura = 0): V3 => [Math.sin(angulo) * distancia, altura, -Math.cos(angulo) * distancia];

/** Dibuja de lejos a cerca: cosas.push({z, dibuja}) y después deLejosACerca(cosas). */
export function deLejosACerca(cosas: {z: number; dibuja: () => void}[]) {
  cosas.sort((a, b) => b.z - a.z).forEach((c) => c.dibuja());
}
