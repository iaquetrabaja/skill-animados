// Partículas y objetos de uso frecuente: moléculas, chispas, un prisma, una persona, un gráfico, un móvil y cifras.
import {G, W, H, V3, RGB, azar, con, entra, rgba, tramo, una} from './base';
import {Camara, proyecta} from './camara';
import {brillo} from './luz';

// ── Partículas ─────────────────────────────────────────────────────────

/** Bolitas en 3D con volumen (moléculas, células, polvo). Se colocan una vez con semilla; la cámara las recorre. */
export function nube3D(g: G, cam: Camara, semilla: number, n: number, caja: [V3, V3], radio: number, color: string, opciones: {mueve?: number; t?: number; alpha?: number} = {}) {
  const lista = una(`nube3d-${semilla}-${n}`, () => {
    const r = azar(semilla);
    return Array.from({length: n}, () => ({p: [r(), r(), r()] as V3, f: r() * 6.28, k: 0.7 + r() * 0.6}));
  });
  const [a, b] = caja;
  const t = opciones.t ?? 0, m = opciones.mueve ?? 0;
  const items = lista.map((e) => {
    const p: V3 = [a[0] + (b[0] - a[0]) * e.p[0] + Math.sin(t * 1.3 + e.f) * m, a[1] + (b[1] - a[1]) * e.p[1] + Math.cos(t * 1.1 + e.f) * m, a[2] + (b[2] - a[2]) * e.p[2]];
    return {q: proyecta(cam, p), k: e.k};
  }).filter((x) => x.q && x.q.x > -200 && x.q.x < W + 200 && x.q.y > -200 && x.q.y < H + 200).sort((x, y) => y.q!.z - x.q!.z);
  for (const {q, k} of items) {
    const rr = radio * k * q!.s;
    if (rr < 0.4) continue;
    const niebla = Math.min(1, Math.max(0, 1.4 - q!.z / 40));
    bola(g, q!.x, q!.y, rr, color, (opciones.alpha ?? 1) * niebla);
  }
}

/** Una bola con luz (arriba a la izquierda), sombra propia y borde de luz. */
export function bola(g: G, x: number, y: number, r: number, color: string, alpha = 1) {
  con(g, {alpha}, () => {
    const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r);
    gr.addColorStop(0, '#ffffff');
    gr.addColorStop(0.25, color);
    gr.addColorStop(1, rgba('#05070f', 0.95));
    g.fillStyle = gr;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  });
}

/** Chispas que salen de un punto en `t0` y caen. Para impactos y rebotes. */
export function chispas(g: G, t: number, t0: number, x: number, y: number, color: string, n = 18, fuerza = 380, semilla = 1) {
  const u = t - t0;
  if (u < 0 || u > 1.2) return;
  const r = azar(semilla);
  con(g, {modo: 'lighter'}, () => {
    for (let i = 0; i < n; i++) {
      const ang = r() * Math.PI * 2, v = fuerza * (0.4 + r() * 0.8);
      const px = x + Math.cos(ang) * v * u, py = y + Math.sin(ang) * v * u + 500 * u * u;
      const a = 1 - u / 1.2;
      g.strokeStyle = rgba(color, a);
      g.lineWidth = 4 * a + 1;
      g.beginPath();
      g.moveTo(px, py);
      g.lineTo(px - Math.cos(ang) * v * 0.04, py - (Math.sin(ang) * v + 1000 * u) * 0.04);
      g.stroke();
    }
  });
}

// ── Objetos ────────────────────────────────────────────────────────────

/** Prisma de vidrio triangular (de frente). Devuelve los puntos de entrada y salida de la luz para dibujar los haces. */
export function prisma(g: G, x: number, y: number, lado: number, giro = 0, alpha = 1) {
  const h = lado * Math.sqrt(3) / 2;
  const p = [[0, -h * 2 / 3], [lado / 2, h / 3], [-lado / 2, h / 3]].map(([px, py]) => [
    x + px * Math.cos(giro) - py * Math.sin(giro), y + px * Math.sin(giro) + py * Math.cos(giro)]);
  con(g, {alpha}, () => {
    g.beginPath();
    p.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
    g.closePath();
    const gr = g.createLinearGradient(p[2][0], p[2][1], p[1][0], p[0][1]);
    gr.addColorStop(0, rgba('#9fd8ff', 0.18));
    gr.addColorStop(0.5, rgba('#ffffff', 0.32));
    gr.addColorStop(1, rgba('#7fb8ff', 0.12));
    g.fillStyle = gr;
    g.fill();
    g.lineJoin = 'round';
    g.strokeStyle = rgba('#e8f6ff', 0.85);
    g.lineWidth = 5;
    g.stroke();
    // Reflejo en la arista izquierda.
    g.strokeStyle = rgba('#ffffff', 0.9);
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(p[0][0] - 10, p[0][1] + 40);
    g.lineTo(p[2][0] + 40, p[2][1] - 30);
    g.stroke();
  });
  return {
    entrada: [(p[0][0] + p[2][0]) / 2, (p[0][1] + p[2][1]) / 2] as [number, number],
    salida: [(p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2] as [number, number],
  };
}

/** Los colores de la luz visible, del rojo al violeta. */
export const ESPECTRO = ['#ff3b30', '#ff9500', '#ffd60a', '#34c759', '#0a84ff', '#5e5ce6', '#bf5af2'];

/** Una persona en silueta (a contraluz o como figura). `pose`: 'pie' | 'mira-arriba' | 'senala'. Altura `alto` en píxeles. */
export function persona(g: G, x: number, y: number, alto: number, color = '#0b0d14', pose: 'pie' | 'mira-arriba' | 'senala' = 'pie', borde?: string) {
  const s = alto / 100;
  const forma = () => {
    g.beginPath();
    const cab = pose === 'mira-arriba' ? [-1.5, -92] : [0, -90];
    g.arc(x + cab[0] * s, y + cab[1] * s, 7.5 * s, 0, Math.PI * 2);
    g.moveTo(x - 9 * s, y - 78 * s);
    g.quadraticCurveTo(x, y - 82 * s, x + 9 * s, y - 78 * s);
    g.lineTo(x + 11 * s, y - 44 * s);
    g.lineTo(x + 6 * s, y - 42 * s);
    g.lineTo(x + 7 * s, y);
    g.lineTo(x + 1.5 * s, y);
    g.lineTo(x, y - 40 * s);
    g.lineTo(x - 1.5 * s, y);
    g.lineTo(x - 7 * s, y);
    g.lineTo(x - 6 * s, y - 42 * s);
    g.lineTo(x - 11 * s, y - 44 * s);
    g.closePath();
    g.fill();
    g.lineCap = 'round';
    g.lineWidth = 5 * s;
    g.beginPath();
    g.moveTo(x - 9 * s, y - 75 * s);
    g.lineTo(x - 13 * s, y - 47 * s);
    g.moveTo(x + 9 * s, y - 75 * s);
    if (pose === 'senala') g.lineTo(x + 34 * s, y - 98 * s);
    else g.lineTo(x + 13 * s, y - 47 * s);
    g.stroke();
  };
  if (borde) {
    con(g, {modo: 'lighter', alpha: 0.6}, () => {
      g.fillStyle = g.strokeStyle = rgba(borde, 0.5);
      g.translate(-2, -2);
      forma();
    });
  }
  g.fillStyle = g.strokeStyle = color;
  forma();
}

/** Gráfico de una cotización o una evolución que se dibuja mientras avanza `u` (0..1). Devuelve la punta. */
export function grafico(g: G, x: number, y: number, ancho: number, alto: number, valores: number[], u: number, color = '#4ade80') {
  const min = Math.min(...valores), max = Math.max(...valores);
  const pts = valores.map((v, i) => [x + (i / (valores.length - 1)) * ancho, y + alto - ((v - min) / (max - min || 1)) * alto] as [number, number]);
  const hasta = u * (pts.length - 1);
  const k = Math.floor(hasta);
  const punta: [number, number] = k >= pts.length - 1 ? pts[pts.length - 1] : [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * (hasta - k), pts[k][1] + (pts[k + 1][1] - pts[k][1]) * (hasta - k)];
  const camino = [...pts.slice(0, k + 1), punta];
  // Relleno bajo la línea.
  const gr = g.createLinearGradient(0, y, 0, y + alto);
  gr.addColorStop(0, rgba(color, 0.35));
  gr.addColorStop(1, rgba(color, 0));
  g.fillStyle = gr;
  g.beginPath();
  g.moveTo(camino[0][0], y + alto);
  camino.forEach(([px, py]) => g.lineTo(px, py));
  g.lineTo(punta[0], y + alto);
  g.fill();
  g.strokeStyle = color;
  g.lineWidth = 9;
  g.lineJoin = g.lineCap = 'round';
  g.beginPath();
  camino.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
  g.stroke();
  brillo(g, punta[0], punta[1], 90, color, 0.9);
  return punta;
}

/** Un móvil con lo que se quiera dibujar en su pantalla (`pantalla` recibe el ancho y alto útiles, con el origen arriba a la izquierda). */
export function movil(g: G, x: number, y: number, alto: number, pantalla: (ancho: number, alto: number) => void, giro = 0) {
  const ancho = alto * 0.49, r = alto * 0.07;
  con(g, {x, y, giro}, () => {
    g.shadowColor = 'rgba(0,0,0,.55)';
    g.shadowBlur = 60;
    g.shadowOffsetY = 30;
    g.fillStyle = '#0d0f14';
    g.beginPath();
    g.roundRect(-ancho / 2, -alto / 2, ancho, alto, r);
    g.fill();
    g.shadowColor = 'transparent';
    g.strokeStyle = '#3a3f4a';
    g.lineWidth = 4;
    g.stroke();
    const m = alto * 0.025;
    g.save();
    g.beginPath();
    g.roundRect(-ancho / 2 + m, -alto / 2 + m, ancho - 2 * m, alto - 2 * m, r * 0.8);
    g.clip();
    g.translate(-ancho / 2 + m, -alto / 2 + m);
    pantalla(ancho - 2 * m, alto - 2 * m);
    g.restore();
    // Reflejo del cristal.
    const gr = g.createLinearGradient(-ancho / 2, -alto / 2, ancho / 2, alto / 2);
    gr.addColorStop(0, 'rgba(255,255,255,.10)');
    gr.addColorStop(0.4, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.beginPath();
    g.roundRect(-ancho / 2, -alto / 2, ancho, alto, r);
    g.fill();
  });
}

// ── Cifras y etiquetas ─────────────────────────────────────────────────

export const LETRA = 'Onest, Arial, sans-serif';

/** Pastilla con texto: para una cifra o un nombre que el subtítulo no dice. Entra con `u` (0..1). */
export function pastilla(g: G, x: number, y: number, texto: string, u = 1, opciones: {color?: string; fondo?: string; tam?: number} = {}) {
  if (u <= 0) return;
  const tam = opciones.tam ?? 54;
  const e = entra(Math.min(1, u));
  con(g, {alpha: Math.min(1, u * 2), x, y: y + (1 - e) * 30, escala: 0.85 + 0.15 * e}, () => {
    g.font = `800 ${tam}px ${LETRA}`;
    const w = g.measureText(texto).width + tam * 1.1;
    g.fillStyle = opciones.fondo ?? 'rgba(8,10,18,.78)';
    g.beginPath();
    g.roundRect(-w / 2, -tam * 0.85, w, tam * 1.7, tam * 0.85);
    g.fill();
    g.strokeStyle = rgba(opciones.color ?? '#ffffff', 0.35);
    g.lineWidth = 3;
    g.stroke();
    g.fillStyle = opciones.color ?? '#ffffff';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(texto, 0, tam * 0.04);
  });
}

/** Una cifra enorme que cuenta de `desde` a `hasta` mientras avanza `u`. */
export function cifra(g: G, x: number, y: number, desde: number, hasta: number, u: number, opciones: {tam?: number; color?: string; prefijo?: string; sufijo?: string; decimales?: number} = {}) {
  const v = desde + (hasta - desde) * entra(tramo(u, 0, 1));
  const txt = (opciones.prefijo ?? '') + v.toLocaleString('es-ES', {minimumFractionDigits: opciones.decimales ?? 0, maximumFractionDigits: opciones.decimales ?? 0}) + (opciones.sufijo ?? '');
  const tam = opciones.tam ?? 220;
  g.font = `900 ${tam}px ${LETRA}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  brillo(g, x, y, tam * 1.6, opciones.color ?? '#ffffff', 0.35);
  g.fillStyle = opciones.color ?? '#ffffff';
  g.fillText(txt, x, y);
}

export type Color = RGB | string;
