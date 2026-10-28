// Esferas con textura de verdad (planetas, lunas, bolas, células), giro, luz y atmósfera.
import {G, RGB, azar, con, gama, lienzo, rgba, ruido, una} from './base';
import {brillo} from './luz';

export type Superficie = {ancho: number; alto: number; px: Uint8ClampedArray};

/** Textura equirectangular a partir de ruido y una gama de colores. `relieve` deforma la gama (más contraste). */
export function superficie(clave: string, semilla: number, colores: string[], opciones: {escala?: number; relieve?: number; bandas?: number; mar?: {nivel: number; colores: string[]}} = {}): Superficie {
  return una(`sup-${clave}`, () => {
    const ancho = 1024, alto = 512;
    const n = ruido(semilla), n2 = ruido(semilla + 11);
    const px = new Uint8ClampedArray(ancho * alto * 4);
    const esc = opciones.escala ?? 1;
    for (let y = 0; y < alto; y++) for (let x = 0; x < ancho; x++) {
      // Coordenadas en un cilindro para que el borde izquierdo case con el derecho.
      const a = (x / ancho) * Math.PI * 2;
      const cx = Math.cos(a) * 3 * esc + 10, cz = Math.sin(a) * 3 * esc + 10, cy = (y / alto) * 6 * esc;
      let v = n(cx + cz * 0.7, cy + cz * 0.3, 6);
      if (opciones.bandas) v = 0.5 + 0.5 * Math.sin(cy * opciones.bandas + n2(cx, cy, 3) * 4);
      v = Math.pow(v, 1 + (opciones.relieve ?? 0));
      let c: RGB;
      if (opciones.mar && v < opciones.mar.nivel) c = gama(v / opciones.mar.nivel, opciones.mar.colores);
      else c = gama(opciones.mar ? (v - opciones.mar.nivel) / (1 - opciones.mar.nivel) : v, colores);
      const i = (y * ancho + x) * 4;
      px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255;
    }
    return {ancho, alto, px};
  });
}

const RES = 520;
/** Para cada píxel del disco: latitud, longitud y normal. Se calcula una vez. */
const mapa = () => una('mapa-esfera', () => {
  const lat = new Float32Array(RES * RES), lon = new Float32Array(RES * RES), nz = new Float32Array(RES * RES), nx = new Float32Array(RES * RES), ny = new Float32Array(RES * RES);
  for (let y = 0; y < RES; y++) for (let x = 0; x < RES; x++) {
    const i = y * RES + x;
    const X = (x + 0.5) / RES * 2 - 1, Y = (y + 0.5) / RES * 2 - 1;
    const r2 = X * X + Y * Y;
    if (r2 > 1) { nz[i] = -1; continue; }
    const Z = Math.sqrt(1 - r2);
    nx[i] = X; ny[i] = Y; nz[i] = Z;
    lat[i] = Math.asin(Y);
    lon[i] = Math.atan2(X, Z);
  }
  return {lat, lon, nx, ny, nz};
});

/**
 * Esfera texturizada de radio `r` en (x, y). `giro` en radianes (el planeta rota), `luz` = dirección de la luz [x, y, z]
 * (z hacia la cámara). `ambiente` la luz mínima del lado de la sombra. `noche` añade luces en la sombra (ciudades).
 */
export function esfera(g: G, x: number, y: number, r: number, sup: Superficie, opciones: {giro?: number; luz?: [number, number, number]; ambiente?: number; inclina?: number; brilloMar?: boolean} = {}) {
  if (r < 1) return;
  const {lat, lon, nx, ny, nz} = mapa();
  const lienzoE = una('lienzo-esfera', () => lienzo(RES, RES));
  const cg = lienzoE.getContext('2d')!;
  const img = cg.createImageData(RES, RES);
  const [lx0, ly0, lz0] = opciones.luz ?? [-0.6, -0.4, 0.7];
  const ll = Math.hypot(lx0, ly0, lz0);
  const lx = lx0 / ll, ly = ly0 / ll, lz = lz0 / ll;
  const amb = opciones.ambiente ?? 0.06;
  const giro = opciones.giro ?? 0;
  const inc = opciones.inclina ?? 0;
  const ci = Math.cos(inc), si = Math.sin(inc);
  for (let i = 0; i < RES * RES; i++) {
    if (nz[i] < 0) continue;
    // Inclinación del eje (gira la normal en el plano de la pantalla antes de leer la textura).
    const X = nx[i] * ci - ny[i] * si, Y = nx[i] * si + ny[i] * ci;
    const la = inc ? Math.asin(Math.max(-1, Math.min(1, Y))) : lat[i];
    const lo = inc ? Math.atan2(X, nz[i]) : lon[i];
    let u = (lo + giro) / (Math.PI * 2);
    u = u - Math.floor(u);
    const v = la / Math.PI + 0.5;
    // Lectura bilineal: bordes suaves aunque el planeta llene la pantalla.
    const fx = u * sup.ancho - 0.5, fy = Math.max(0, Math.min(sup.alto - 1.001, v * sup.alto - 0.5));
    const x0 = ((Math.floor(fx) % sup.ancho) + sup.ancho) % sup.ancho, x1 = (x0 + 1) % sup.ancho, y0 = Math.floor(fy), y1 = Math.min(sup.alto - 1, y0 + 1);
    const ax = fx - Math.floor(fx), ay = fy - y0;
    const k00 = (y0 * sup.ancho + x0) * 4, k10 = (y0 * sup.ancho + x1) * 4, k01 = (y1 * sup.ancho + x0) * 4, k11 = (y1 * sup.ancho + x1) * 4;
    const c0 = (sup.px[k00] * (1 - ax) + sup.px[k10] * ax) * (1 - ay) + (sup.px[k01] * (1 - ax) + sup.px[k11] * ax) * ay;
    const c1 = (sup.px[k00 + 1] * (1 - ax) + sup.px[k10 + 1] * ax) * (1 - ay) + (sup.px[k01 + 1] * (1 - ax) + sup.px[k11 + 1] * ax) * ay;
    const c2 = (sup.px[k00 + 2] * (1 - ax) + sup.px[k10 + 2] * ax) * (1 - ay) + (sup.px[k01 + 2] * (1 - ax) + sup.px[k11 + 2] * ax) * ay;
    const d = nx[i] * lx + ny[i] * ly + nz[i] * lz;
    const luz = amb + (1 - amb) * Math.max(0, d) ** 0.9;
    // Oscurece hacia el borde (limb darkening) para que parezca una bola y no un disco.
    const borde = 0.55 + 0.45 * Math.pow(nz[i], 0.5);
    let espec = 0;
    if (opciones.brilloMar && c2 > c0 + 30) {
      // Reflejo del sol en el agua: normal · vector medio entre la luz y la cámara.
      const hl = Math.hypot(lx, ly, lz + 1) || 1;
      const h = Math.max(0, (nx[i] * lx + ny[i] * ly + nz[i] * (lz + 1)) / hl);
      espec = Math.pow(h, 60) * 70;
    }
    const o = i * 4;
    img.data[o] = c0 * luz * borde + espec;
    img.data[o + 1] = c1 * luz * borde + espec;
    img.data[o + 2] = c2 * luz * borde + espec;
    img.data[o + 3] = 255;
  }
  cg.putImageData(img, 0, 0);
  g.save();
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.clip();
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  g.drawImage(lienzoE, x - r, y - r, r * 2, r * 2);
  g.restore();
}

/** Atmósfera: anillo de luz en el borde iluminado. `grosor` relativo al radio. */
export function atmosfera(g: G, x: number, y: number, r: number, color: string, fuerza = 1, grosor = 0.08, luz: [number, number] = [-0.6, -0.4]) {
  con(g, {modo: 'lighter', alpha: fuerza}, () => {
    const gr = g.createRadialGradient(x, y, r * (1 - grosor), x, y, r * (1 + grosor * 2.5));
    gr.addColorStop(0, rgba(color, 0));
    gr.addColorStop(0.3, rgba(color, 0.75));
    gr.addColorStop(1, rgba(color, 0));
    g.fillStyle = gr;
    g.beginPath();
    g.arc(x, y, r * (1 + grosor * 2.5), 0, Math.PI * 2);
    g.fill();
  });
  // Más luz del lado del sol.
  brillo(g, x + luz[0] * r * 0.85, y + luz[1] * r * 0.85, r * 0.9, color, 0.25 * fuerza);
}

// ── Superficies listas ─────────────────────────────────────────────────

export const tierra = () => superficie('tierra', 41, ['#2f6b34', '#4f7d3a', '#86784a', '#b39f72'], {escala: 1.1, mar: {nivel: 0.56, colores: ['#0a2a66', '#1655a6', '#2f86c9']}});
export const marte = () => superficie('marte', 9, ['#5a2614', '#9a4a24', '#c46a35', '#e0a066'], {escala: 1.3, relieve: 0.4});
export const luna = () => superficie('luna', 23, ['#4d4d52', '#7d7c80', '#a9a8aa', '#d6d4d1'], {escala: 1.6, relieve: 0.6});
export const gaseoso = (semilla = 5, colores = ['#8b5a3c', '#d9b38c', '#f2e2c4', '#b07850']) => superficie(`gas-${semilla}`, semilla, colores, {bandas: 4});
export const estrellaSup = (color: string[] = ['#ff9a2e', '#ffd36b', '#fff4c9']) => superficie(`estrella-${color.join()}`, 61, color, {escala: 2.2});

/** Una roca irregular (asteroide, piedra) con su luz. */
export function roca(g: G, x: number, y: number, r: number, semilla: number, giro = 0, color = '#7a6a5e', luz: [number, number] = [-0.6, -0.5]) {
  const a = azar(semilla);
  const puntos = Array.from({length: 11}, (_, i) => (i / 11) * Math.PI * 2 + a.entre(-0.15, 0.15)).map((ang) => [ang, r * a.entre(0.72, 1.08)] as const);
  g.save();
  g.translate(x, y);
  g.scale(1, 0.62);
  g.rotate(giro);
  g.beginPath();
  puntos.forEach(([ang, d], i) => (i ? g.lineTo : g.moveTo).call(g, Math.cos(ang) * d, Math.sin(ang) * d));
  g.closePath();
  const gr = g.createRadialGradient(luz[0] * r * 0.6, luz[1] * r * 0.6, r * 0.1, 0, 0, r * 1.2);
  gr.addColorStop(0, rgba(color));
  gr.addColorStop(0.55, rgba(color, 1));
  gr.addColorStop(1, '#120d0a');
  g.fillStyle = gr;
  g.fill();
  g.restore();
}
