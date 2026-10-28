// Tiempo, azar con semilla y color. Todo es función del segundo `t`: ningún fotograma depende del anterior.

export type G = CanvasRenderingContext2D;
export type V3 = [number, number, number];

export const W = 1080;
export const H = 1920;

/** 0 → 1 entre a y b (fuera, se queda en 0 o en 1). */
export const tramo = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / Math.max(1e-6, b - a)));
/** Arranca y frena sin tirones. */
export const suave = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);
/** Llega rápido y frena largo: para lo que entra. */
export const entra = (u: number) => 1 - Math.pow(1 - u, 3);
/** Arranca despacio y se va rápido: para lo que sale. */
export const sale = (u: number) => u * u * u;
/** Se pasa un poco y vuelve: para lo que se posa. */
export const rebote = (u: number) => {
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2);
};
/** Un latido de 0 → 1 → 0 centrado en t0. */
export const pulso = (t: number, t0: number, ancho = 0.3) => {
  const x = (t - t0) / ancho;
  return Math.abs(x) >= 1 ? 0 : 0.5 + 0.5 * Math.cos(x * Math.PI);
};
export const mezcla = (a: number, b: number, u: number) => a + (b - a) * u;
export const mezV = (a: V3, b: V3, u: number): V3 => [mezcla(a[0], b[0], u), mezcla(a[1], b[1], u), mezcla(a[2], b[2], u)];

/** Pasa por varios valores en sus tiempos, suavizando cada tramo: claves(t, [[0, 1], [2, 1.5], [3, 1]]). */
export function claves(t: number, puntos: [number, number][]): number {
  if (t <= puntos[0][0]) return puntos[0][1];
  for (let i = 1; i < puntos.length; i++) {
    const [t1, v1] = puntos[i];
    const [t0, v0] = puntos[i - 1];
    if (t <= t1) return mezcla(v0, v1, suave(tramo(t, t0, t1)));
  }
  return puntos[puntos.length - 1][1];
}

/** Generador con semilla (mulberry32). Nunca Math.random: el render dibuja trozos del vídeo en paralelo. */
export function azar(semilla: number) {
  let s = semilla >>> 0;
  const r = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = s;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  return Object.assign(r, {
    entre: (a: number, b: number) => a + (b - a) * r(),
    signo: () => (r() < 0.5 ? -1 : 1),
  });
}

/** Ruido suave 2D con semilla (value noise con varias octavas). Devuelve 0..1. */
export function ruido(semilla: number) {
  const n = 256;
  const r = azar(semilla);
  const tabla = Array.from({length: n * n}, () => r());
  const at = (x: number, y: number) => tabla[((y % n) + n) % n * n + (((x % n) + n) % n)];
  const capa = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const fx = suave(x - xi), fy = suave(y - yi);
    return mezcla(mezcla(at(xi, yi), at(xi + 1, yi), fx), mezcla(at(xi, yi + 1), at(xi + 1, yi + 1), fx), fy);
  };
  return (x: number, y: number, octavas = 4) => {
    let v = 0, amp = 0.5, f = 1, total = 0;
    for (let o = 0; o < octavas; o++) {
      v += capa(x * f, y * f) * amp;
      total += amp;
      amp *= 0.5;
      f *= 2;
    }
    return v / total;
  };
}

// ── Color ──────────────────────────────────────────────────────────────

export type RGB = [number, number, number];
export const hex = (c: string): RGB => {
  if (c.startsWith('rgb')) {
    const [r, g, b] = c.replace(/[^\d.,]/g, '').split(',').map(Number);
    return [r, g, b];
  }
  const h = c.replace('#', '');
  const v = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
};
export const rgba = (c: string | RGB, a = 1) => {
  const [r, g, b] = typeof c === 'string' ? hex(c) : c;
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${Math.max(0, Math.min(1, a))})`;
};
export const mezColor = (a: string | RGB, b: string | RGB, u: number): RGB => {
  const x = typeof a === 'string' ? hex(a) : a, y = typeof b === 'string' ? hex(b) : b;
  return [mezcla(x[0], y[0], u), mezcla(x[1], y[1], u), mezcla(x[2], y[2], u)];
};
/** Varios colores a lo largo de u (0..1): gama(u, ['#000', '#f80', '#fff']). */
export const gama = (u: number, cs: string[]): RGB => {
  const x = Math.max(0, Math.min(1, u)) * (cs.length - 1);
  const i = Math.min(cs.length - 2, Math.floor(x));
  return mezColor(cs[i], cs[i + 1], x - i);
};

// ── Lienzos auxiliares ─────────────────────────────────────────────────

/** Lienzo fuera de pantalla. Úsalo para texturas que se calculan una vez (con `una`). */
export const lienzo = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

const cache = new Map<string, unknown>();
/** Calcula algo pesado una sola vez por pestaña del render: una('nubes-3', () => ...). */
export function una<T>(clave: string, crear: () => T): T {
  if (!cache.has(clave)) cache.set(clave, crear());
  return cache.get(clave) as T;
}

/** Dibuja con transparencia, modo de mezcla o transformaciones y deja `g` como estaba. */
export function con(g: G, opciones: {alpha?: number; modo?: GlobalCompositeOperation; x?: number; y?: number; escala?: number; giro?: number}, f: () => void) {
  if (opciones.alpha !== undefined && opciones.alpha <= 0.002) return;
  g.save();
  if (opciones.alpha !== undefined) g.globalAlpha *= opciones.alpha;
  if (opciones.modo) g.globalCompositeOperation = opciones.modo;
  if (opciones.x !== undefined || opciones.y !== undefined) g.translate(opciones.x ?? 0, opciones.y ?? 0);
  if (opciones.giro) g.rotate(opciones.giro);
  if (opciones.escala !== undefined) g.scale(opciones.escala, opciones.escala);
  f();
  g.restore();
}
