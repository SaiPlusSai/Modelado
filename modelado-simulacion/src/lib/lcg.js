// src/lib/lcg.js

/**
 * Genera una secuencia con el generador congruencial lineal:
 *   co = ((a * x) + c) % m
 *   r  = co / (m - 1)   (normalizado)
 *
 * Pasa c = 0 para el caso multiplicativo.
 */
export function lcgSequence({ a, c, m, seed, n, normalized = true }) {
  let x = Number(seed);
  const raw = [];
  const norm = [];

  for (let i = 0; i < n; i++) {
    // mod seguro por si acaso (evita negativos)
    const co = (((a * x) + c) % m + m) % m;
    const r = m > 1 ? co / (m - 1) : NaN;

    raw.push(co);
    norm.push(r);

    x = co; // siguiente semilla
  }

  return { raw, normalized: normalized ? norm : [] };
}
