// Demo: «¿Por qué el cielo es azul?». Cuatro sitios (el cielo, el espacio con el prisma, el aire, el suelo) y Marte.
import * as k from '../motor';
import type {Plano} from '../motor/Pelicula';
import datos from '../../public/cielo/cues.json';

export const voz = k.crearVoz(datos);
const f = (n: number) => voz.frase(n);
const AZUL = '#4f9dff', ROJO = '#ff4b3a', NARANJA = '#ff9a3c';
export const CLAVES = ['azul', 'blanca', 'colores', 'moleculas', 'cinco', 'atardecer', 'naranja', 'marte', 'azules'];

// ── 1 · El cielo. La cámara sube del horizonte al Sol; en «blanca», el Sol lo llena todo de luz blanca. ──
const Tazul = f(1).t('azul'), Tblanca = f(1).t('blanca');
const cieloInicio: Plano = {
  nombre: 'cielo',
  desde: 0,
  dibuja(g, t) {
    const sube = k.suave(k.tramo(t, 0, Tblanca + 0.1));
    const baja = sube * 900; // al subir la cámara, todo baja en la pantalla
    k.cielo(g, 0.9 - 0.15 * sube, 1380 + baja);
    // Antes de «azul» el cielo está más pálido; en «azul» se satura.
    k.con(g, {alpha: 0.5 * (1 - k.suave(k.tramo(t, Tazul - 0.4, Tazul + 0.3)))}, () => {
      g.fillStyle = '#c9d6e6';
      g.fillRect(0, 0, k.W, k.H);
    });
    const sx = 760 - 220 * sube, sy = 560 + baja * 0.5;
    k.sol(g, sx, sy, 80 + 30 * sube, '#fff8e6', 1, t);
    k.nubes(g, t * 3, 980 + baja * 0.55, 380, 0.3, '#ffffff', 0.7, 5);
    k.nubes(g, t * 4.5, 1220 + baja * 0.8, 520, 0.8, '#ffffff', 0.9, 8);
    k.colinas(g, 1380 + baja, '#1f4a2c', '#bfe3ff', 3);
    // «blanca»: el Sol estalla en blanco y se apaga antes del corte.
    const luz = k.tramo(t, Tblanca - 0.05, f(2).inicio - 0.1);
    k.con(g, {alpha: Math.sin(Math.PI * luz) * 0.95}, () => {
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, k.W, k.H);
    });
    k.fogonazo(g, sx, sy, 1400, luz);
    // Velo suave detrás del subtítulo mientras todo está blanco: si no, «blanca» no se lee.
    k.con(g, {alpha: Math.sin(Math.PI * luz)}, () => {
      const gr = g.createLinearGradient(0, 220, 0, 640);
      gr.addColorStop(0, 'rgba(10,20,40,0)');
      gr.addColorStop(0.45, 'rgba(10,20,40,.55)');
      gr.addColorStop(1, 'rgba(10,20,40,0)');
      g.fillStyle = gr;
      g.fillRect(0, 220, k.W, 420);
    });
  },
};

// ── 2 · El prisma. Un rayo blanco entra y en «colores» se abre en todos los colores. ──
const Tcolores = f(2).t('colores'), Tmezclados = f(2).t('mezclados');
const prisma: Plano = {
  nombre: 'prisma',
  desde: f(2).inicio,
  dibuja(g, t) {
    const t0 = f(2).inicio;
    const cam = k.mira([Math.sin(t * 0.4) * 2 + (t - t0) * 1.2, 0, 0], [0, 0, 30]);
    const antes = k.mira([Math.sin((t - 1 / 30) * 0.4) * 2 + (t - 1 / 30 - t0) * 1.2, 0, 0], [0, 0, 30]);
    k.espacio(g, '#2a2060', 0.8);
    k.estrellas(g, cam, antes, 2, 1200, 300);
    const zoom = 1 + 0.12 * k.suave(k.tramo(t, t0, f(3).inicio));
    k.con(g, {x: 540, y: 1000, escala: zoom}, () => {
      g.translate(-540, -1000);
      k.sol(g, -40, 760, 140, '#fff4dc', 0.9, t);
      const giro = -0.08 + 0.05 * Math.sin((t - t0) * 0.8);
      const p = k.prisma(g, 560, 1020, 460, giro, 0); // con alpha 0 solo da los puntos; el vidrio se dibuja encima de la luz
      k.haz(g, -40, 760, p.entrada[0], p.entrada[1], '#ffffff', 34, k.entra(k.tramo(t, t0, t0 + 0.55)));
      const abre = k.entra(k.tramo(t, Tcolores - 0.2, Tmezclados + 0.25));
      k.ESPECTRO.forEach((c, i) => {
        const ang = -0.12 + i * 0.1 + giro * 0.5;
        const lx = p.salida[0] + Math.cos(ang) * 900, ly = p.salida[1] + Math.sin(ang) * 900;
        k.haz(g, p.salida[0], p.salida[1], lx, ly, c, 26, abre, 0.95);
      });
      // Dentro del vidrio, la luz se tiñe.
      k.brillo(g, (p.entrada[0] + p.salida[0]) / 2, (p.entrada[1] + p.salida[1]) / 2, 220, '#ffffff', 0.35 + 0.3 * abre);
      k.prisma(g, 560, 1020, 460, giro, 1);
    });
  },
};

// ── 3 · El aire. La Tierra crece hasta que entramos en su atmósfera y aparecen las moléculas;
//     los rayos llegan, el rojo pasa recto, el azul rebota y acaba saliendo en todas direcciones. ──
const Ttierra = f(3).t('tierra'), Tmoleculas = f(3).t('moleculas');
const Trebotan = f(4).t('rebotan'), Trebota = f(5).t('rebota'), Tcinco = f(5).t('cinco'), Trojo = f(5).t('rojo');
const Tdisparado = f(5).t('disparado'), Tdirecciones = f(5).t('direcciones');
const camAire = (t: number) => {
  const z = k.claves(t, [[f(3).inicio, -6], [Tmoleculas, 0], [f(4).inicio, 10], [f(6).inicio, 16]]);
  return k.mira([0, 0, z], [0, 0, z + 30], 1500);
};
// Moléculas concretas donde rebota el azul (en pantalla), y la ruta del azul.
const REBOTES: [number, number][] = [[-60, 940], [430, 960], [690, 700], [330, 610], [760, 1230], [470, 1420], [900, 1000]];
const camino = (g: k.G, pts: [number, number][], u: number, color: string, ancho: number) => {
  const total = pts.length - 1;
  const hasta = u * total;
  for (let i = 0; i < Math.ceil(hasta); i++) {
    const a = pts[i], b = pts[i + 1];
    const v = Math.min(1, hasta - i);
    k.haz(g, a[0], a[1], b[0], b[1], color, ancho, v, 0.95);
    if (i > 0) k.brillo(g, a[0], a[1], 110, color, 0.8);
  }
};
const aire: Plano = {
  nombre: 'aire',
  desde: f(3).inicio,
  dibuja(g, t) {
    const t0 = f(3).inicio;
    k.espacio(g, '#203060', 0.7);
    const cam = camAire(t);
    k.estrellas(g, k.mira([0, 0, (t - t0) * 3], [0, 0, (t - t0) * 3 + 30]), null, 3, 900, 300);
    // La Tierra: crece y baja hasta que su atmósfera llena la pantalla.
    const r = k.claves(t, [[t0, 380], [Ttierra, 470], [Tmoleculas - 0.2, 1300], [Tmoleculas + 0.4, 2400]]);
    const cy = 1050 + (r - 380) * 0.95;
    const giro = (t - t0) * 0.25;
    k.esfera(g, 540, cy, r, k.tierra(), {giro, luz: [-0.5, -0.6, 0.65], ambiente: 0.04, brilloMar: true});
    k.atmosfera(g, 540, cy, r, '#6ab8ff', 1, 0.07, [-0.5, -0.6]);
    // Dentro del aire: el azul del cielo de cerca y las moléculas.
    const dentro = k.suave(k.tramo(t, Tmoleculas - 0.5, Tmoleculas + 0.3));
    k.con(g, {alpha: dentro}, () => {
      const gr = g.createLinearGradient(0, 0, 0, k.H);
      gr.addColorStop(0, '#071430');
      gr.addColorStop(1, '#0e2b5c');
      g.fillStyle = gr;
      g.fillRect(0, 0, k.W, k.H);
      k.nube3D(g, cam, 31, 420, [[-14, -26, 2], [14, 26, 70]], 0.32, '#9cc7ff', {mueve: 0.4, t});
    });
    if (t < f(4).inicio - 0.3) return;
    // Los dos rayos llegan desde la izquierda en «colores».
    const llega = k.entra(k.tramo(t, f(4).t('colores') - 0.1, Trebotan));
    k.haz(g, -60, 1140, 1140, 1100, ROJO, 30, llega, 0.9);
    // El azul choca y rebota: en «rebotan» el primer choque, en «rebota» sigue rebotando.
    const ruta = k.claves(t, [[f(4).t('colores') - 0.1, 0], [Trebotan + 0.2, 1.2], [Trebota, 1.4], [Tcinco + 0.2, 6]]) / 6;
    // Las moléculas donde rebota el azul, grandes y a la vista.
    camino(g, REBOTES, ruta, AZUL, 28);
    // Las moléculas donde rebota el azul, encima del rayo para que se vea que choca con ellas.
    REBOTES.slice(1).forEach(([x, y], i) => k.bola(g, x, y, 38 + (i % 3) * 6, '#a9ccff', k.tramo(t, f(4).inicio - 0.3, f(4).inicio + 0.2)));
    k.chispas(g, t, Trebotan + 0.1, REBOTES[1][0], REBOTES[1][1], '#cfe4ff', 16, 300, 4);
    // ×5 y ×1, al lado de cada rayo.
    k.pastilla(g, 300, 1560, 'azul ×5', k.tramo(t, Tcinco, Tcinco + 0.35), {color: '#9cc7ff'});
    k.pastilla(g, 800, 1560, 'rojo ×1', k.tramo(t, Trojo, Trojo + 0.35), {color: '#ff9a8f'});
    // «disparado en todas direcciones»: cada molécula escupe azul hacia todos lados y el aire se vuelve azul.
    const sale = k.tramo(t, Tdisparado - 0.15, Tdirecciones + 0.5);
    const fuentes = REBOTES.slice(1);
    fuentes.forEach(([x, y], i) => {
      for (let j = 0; j < 8; j++) {
        const ang = j * Math.PI / 4 + i * 0.4;
        const u = k.entra(k.tramo(sale, i * 0.06, 0.55 + i * 0.06));
        k.haz(g, x, y, x + Math.cos(ang) * 700, y + Math.sin(ang) * 700, AZUL, 18, u, 0.6);
      }
    });
    k.con(g, {modo: 'lighter', alpha: 0.6 * k.suave(k.tramo(t, Tdirecciones - 0.2, Tdirecciones + 0.6))}, () => {
      g.fillStyle = '#1d5fd1';
      g.fillRect(0, 0, k.W, k.H);
    });
  },
};

// ── 4 · El suelo. Alguien mira arriba: el azul le llega de todas partes. Luego el Sol baja y solo llega el naranja. ──
const HOR = 1250;
const OJO: [number, number] = [535, 1025];
const Tmires = f(6).t('mires'), Tllega = f(6).t('llega'), Tatardecer = f(7).t('atardecer');
const Tcruza = f(7).t('cruza'), Tpierde = f(8).t('pierde'), Tnaranja = f(8).t('naranja');
const suelo: Plano = {
  nombre: 'suelo',
  desde: f(6).inicio,
  dibuja(g, t) {
    const t0 = f(6).inicio;
    const ocaso = k.suave(k.tramo(t, Tatardecer - 0.1, Tcruza + 0.6));
    const solAlto = 0.85 - 0.83 * ocaso;
    const zoom = k.claves(t, [[t0, 1.08], [Tllega + 0.3, 1], [Tcruza, 1], [Tnaranja + 0.6, 1.1]]);
    k.con(g, {x: 540, y: 1100, escala: zoom}, () => {
      g.translate(-540, -1100);
      k.cielo(g, solAlto, HOR);
      const sx = 800 + 90 * ocaso, sy = 480 + (HOR - 480 - 20) * ocaso;
      k.sol(g, sx, sy, 70 + 25 * ocaso, ocaso > 0.5 ? '#ffd6a0' : '#fff8e6', 1, t);
      k.nubes(g, t, 700, 300, 0.2, k.rgba(k.mezColor('#ffffff', '#ff9a5c', ocaso)), 0.55, 9);
      k.colinas(g, HOR, k.rgba(k.mezColor('#1f4a2c', '#2a1a22', ocaso)), k.rgba(k.mezColor('#bfe3ff', '#ffb070', ocaso)), 4);
      // La persona, de pie en la colina, mirando arriba.
      k.persona(g, 540, 1330, 330, '#06080c', 'mira-arriba', ocaso > 0.3 ? NARANJA : '#cfe7ff');
      // «mires donde mires»: rayos azules que llegan de todo el cielo a sus ojos.
      const desde = [[60, 520], [260, 380], [470, 560], [700, 420], [920, 600], [140, 880], [980, 880]];
      const llega = k.tramo(t, Tmires - 0.3, Tllega + 0.2);
      const apaga = 1 - k.suave(k.tramo(t, Tatardecer, Tatardecer + 0.6));
      desde.forEach(([x, y], i) => {
        const u = k.entra(k.tramo(llega, i * 0.08, 0.45 + i * 0.08));
        k.haz(g, x, y, OJO[0], OJO[1], AZUL, 14, u, 0.75 * apaga);
      });
      k.brillo(g, OJO[0], OJO[1], 140, AZUL, k.pulso(t, Tllega + 0.25, 0.5) * apaga);
      // Al atardecer: el camino de la luz se alarga por el aire espeso de cerca del suelo.
      const camino = k.suave(k.tramo(t, Tcruza - 0.1, f(7).fin));
      if (ocaso > 0.6) {
        k.con(g, {alpha: camino * 0.55}, () => {
          const gr = g.createLinearGradient(0, HOR - 260, 0, HOR);
          gr.addColorStop(0, 'rgba(255,170,110,0)');
          gr.addColorStop(1, 'rgba(255,170,110,.35)');
          g.fillStyle = gr;
          g.fillRect(0, HOR - 260, k.W, 260);
        });
        // El rayo cruza de derecha a izquierda; por el camino se le escapa el azul.
        const pierde = k.tramo(t, Tpierde - 0.2, Tnaranja - 0.1);
        k.haz(g, sx, sy, OJO[0], OJO[1], k.mezColor('#ffffff', NARANJA, k.suave(pierde)), 22, camino, 0.95);
        const r = k.azar(17);
        for (let i = 0; i < 40; i++) {
          const a = r();
          const x = sx + (OJO[0] - sx) * a, y = sy + (OJO[1] - sy) * a;
          const u = k.tramo(pierde, a * 0.5, a * 0.5 + 0.5);
          if (u <= 0 || u >= 1) continue;
          const ang = -Math.PI / 2 + r.entre(-1.1, 1.1);
          k.bola(g, x + Math.cos(ang) * 380 * u, y + Math.sin(ang) * 380 * u, 15, AZUL, 1 - u);
          k.brillo(g, x + Math.cos(ang) * 380 * u, y + Math.sin(ang) * 380 * u, 70, AZUL, 0.8 * (1 - u));
        }
        k.brillo(g, OJO[0], OJO[1], 200, NARANJA, k.suave(k.tramo(t, Tnaranja - 0.2, Tnaranja + 0.4)));
      }
    });
  },
};

// ── 5 · Marte. El planeta llena la pantalla, bajamos a su suelo ocre y su Sol se pone con un halo azul. ──
const Tmarte = f(9).t('marte'), Trevés = f(9).t('reves'), Trojizo = f(9).t('rojizo');
const Tatardeceres = f(9).t('atardeceres'), Tazules = f(9).t('azules');
const marte: Plano = {
  nombre: 'marte',
  desde: f(9).inicio,
  dibuja(g, t) {
    const t0 = f(9).inicio;
    // Suelo de Marte.
    const baja = k.suave(k.tramo(t, Tatardeceres - 0.3, Tazules + 0.4));
    const MH = 1300;
    k.cielo(g, 0.8 - 0.8 * baja, MH, 'marte');
    k.con(g, {alpha: 0.35 * k.suave(k.tramo(t, Trojizo - 0.3, Trojizo + 0.4)) * (1 - baja)}, () => {
      g.fillStyle = '#d98a4a';
      g.globalCompositeOperation = 'soft-light';
      g.fillRect(0, 0, k.W, MH);
    });
    const sy = 560 + (MH - 560 - 10) * baja;
    k.brillo(g, 540, sy, 300 + 500 * baja, '#6fa8ff', 0.25 + 0.75 * baja);
    k.sol(g, 540, sy, 34, '#f4f7ff', 0.6, t);
    k.colinas(g, MH, k.rgba(k.mezColor('#6b3a22', '#24140f', baja)), k.rgba(k.mezColor('#e0a066', '#5a6fa0', baja)), 12);
    [[160, 1500, 70, 1], [860, 1560, 95, 2], [420, 1640, 50, 3]].forEach(([x, y, r, s]) =>
      k.roca(g, x, y, r, s, 0.2 * s, k.rgba(k.mezColor('#a0603a', '#3a2a2a', baja)), [-0.1, -0.9]));
    // El planeta delante, hasta que la cámara entra.
    const entraR = k.claves(t, [[t0, 430], [Tmarte, 520], [Trevés - 0.2, 1500], [Trevés + 0.35, 4200]]);
    const fuera = 1 - k.suave(k.tramo(t, Trevés - 0.15, Trevés + 0.35));
    if (fuera > 0) {
      k.con(g, {alpha: fuera}, () => {
        k.espacio(g, '#402018', 0.6);
        k.estrellas(g, k.mira([0, 0, (t - t0) * 2], [0, 0, (t - t0) * 2 + 30]), null, 4, 900, 300);
        const cy = 1000 + (entraR - 430) * 0.9;
        k.esfera(g, 540, cy, entraR, k.marte(), {giro: (t - t0) * 0.3, luz: [-0.6, -0.5, 0.6], ambiente: 0.05});
        k.atmosfera(g, 540, cy, entraR, '#e8a070', 0.6, 0.04, [-0.6, -0.5]);
      });
    }
  },
};

export const PLANOS: Plano[] = [cieloInicio, prisma, aire, suelo, marte];
export const DURACION = voz.duracion + 0.7;
