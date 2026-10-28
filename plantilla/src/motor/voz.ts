// Los tiempos de la voz: en qué segundo se dice cada palabra y dónde empieza y acaba cada frase.

export type Palabra = {w: string; texto: string; t: number; f: number; estimado?: boolean};
export type Frase = {n: number; texto: string; inicio: number; fin: number; palabras: Palabra[]; t: (palabra: string, vez?: number) => number; fin_: (palabra: string, vez?: number) => number};
export type Voz = {
  palabras: Palabra[];
  duracion: number;
  frases: Frase[];
  /** Segundo en que empieza la `vez`-ésima «palabra» de toda la voz. Sin tildes ni signos: «¿Qué» es "que". */
  t: (palabra: string, vez?: number) => number;
  /** Segundo en que acaba. */
  fin: (palabra: string, vez?: number) => number;
  /** La frase n (empezando en 1), con sus palabras y su propio t(). */
  frase: (n: number) => Frase;
};

export const limpia = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ]/g, '');

const busca = (lista: Palabra[], palabra: string, vez: number, donde: string) => {
  const w = limpia(palabra);
  const hits = lista.filter((p) => p.w === w);
  if (!Number.isInteger(vez) || vez < 1 || hits.length < vez) throw new Error(`«${palabra}» (vez ${vez}) no está en ${donde}`);
  return hits[vez - 1];
};

export function crearVoz(datos: {palabras: Palabra[]; duracion: number}): Voz {
  const palabras = datos.palabras;
  const frases: Frase[] = [];
  let actual: Palabra[] = [];
  palabras.forEach((p, i) => {
    actual.push(p);
    if (/[.?!…]$/.test(p.texto) || i === palabras.length - 1) {
      const ps = actual;
      const n = frases.length + 1;
      frases.push({
        n, palabras: ps, texto: ps.map((x) => x.texto).join(' '), inicio: ps[0].t, fin: ps[ps.length - 1].f,
        t: (w, vez = 1) => busca(ps, w, vez, `la frase ${n}`).t,
        fin_: (w, vez = 1) => busca(ps, w, vez, `la frase ${n}`).f,
      });
      actual = [];
    }
  });
  return {
    palabras, duracion: datos.duracion, frases,
    t: (w, vez = 1) => busca(palabras, w, vez, 'la voz').t,
    fin: (w, vez = 1) => busca(palabras, w, vez, 'la voz').f,
    frase: (n) => {
      if (!frases[n - 1]) throw new Error(`No hay frase ${n}: la voz tiene ${frases.length}`);
      return frases[n - 1];
    },
  };
}
