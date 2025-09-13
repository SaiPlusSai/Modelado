import React, { useEffect, useMemo, useState } from "react";

/** -------------------- Utils -------------------- */
const isInt = (v) => Number.isInteger(v);
function gcd(a, b) { a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b, a%b]; } return a; }
function primeFactors(n) {
  const fs = new Set(); let x = n;
  while (x % 2 === 0) { fs.add(2); x /= 2; }
  for (let i = 3; i * i <= x; i += 2) {
    while (x % i === 0) { fs.add(i); x /= i; }
  }
  if (x > 2) fs.add(x);
  return [...fs];
}
const isPowerOfTwo = (m) => m > 0 && (m & (m - 1)) === 0;

/** ---- helper: Ui = Xi / (m-1) con decimales ---- */
const ui = (x, m, decimals = 0) => (x / (m - 1)).toFixed(decimals);

/** -------------------- Generador (ADITIVO) -------------------- */
function generateFullPeriodAditivo({ a, c, m, seed }) {
  const raw = [seed];
  const rows = [];
  const seen = new Map();
  seen.set(seed, 0);

  let x = seed;
  let period = null;

  for (let i = 1; i <= m; i++) {
    const opNoMod = a * x + c;
    const xi = ((opNoMod % m) + m) % m;
    rows.push({
      i,
      prev: x,
      opText: `(${a} * ${x} + ${c}) mod ${m}`,
      opNoMod,
      m,
      xi,
      explanation: "Multiplico Xi-1 por a, sumo c y reduzco módulo m.",
    });
    raw.push(xi);

    if (seen.has(xi)) { period = i - seen.get(xi); break; }
    seen.set(xi, i);
    x = xi;
  }
  if (period == null) period = Math.min(rows.length, m);
  return { raw, rows, period, m };
}

/** -------------------- Componente -------------------- */
export default function LcgAditivo() {
  /**
   * modeA: 0 = ingresar a, 1 = usar k (a = 1 + 4k)
   * modeM: 0 = usar g (m = 2^g), 1 = ingresar m directo, 2 = usar p (g = log(p)/log(2); m = 2^g)
   */
  const [modeA, setModeA] = useState(0);
  const [modeM, setModeM] = useState(0);

  // Campos como string para permitir vacío
  const [fields, setFields] = useState({
    a: "", k: "",
    c: "",
    g: "", m: "", p: "",
    seed: "",
    decimals: ""
  });

  const onField = (e) => {
    const { name, value } = e.target;
    setFields((p) => ({ ...p, [name]: value }));
  };

  // Derivados: a, m, g según modos (y validaciones)
  const derived = useMemo(() => {
    const errors = [];
    const hints = [];

    // decimales
    const D = fields.decimals === "" ? NaN : Number(fields.decimals);
    if (!Number.isNaN(D) && (!isInt(D) || D < 0 || D > 10)) {
      errors.push("decimales debe ser entero entre 0 y 10.");
    }

    // a via modo
    let A = NaN;
    if (modeA === 0) {
      if (fields.a !== "") {
        A = Number(fields.a);
        if (!isInt(A) || A <= 0) errors.push("a debe ser entero positivo.");
      }
    } else {
      if (fields.k !== "") {
        const K = Number(fields.k);
        if (!isInt(K) || K <= 0) {
          errors.push("k debe ser entero positivo.");
        } else {
          A = 1 + 4 * K;
        }
      }
    }

    // m/g/p via modo
    let M = NaN, G = NaN;
    if (modeM === 0) {
      // g → m = 2^g
      if (fields.g !== "") {
        G = Number(fields.g);
        if (!isInt(G) || G < 2 || G > 31) {
          errors.push("g debe ser entero entre 2 y 31 (m = 2^g).");
        } else {
          M = 2 ** G;
        }
      }
    } else if (modeM === 1) {
      // m directo → g = log2(m)
      if (fields.m !== "") {
        M = Number(fields.m);
        if (!isInt(M) || M <= 1) {
          errors.push("m debe ser entero > 1.");
        } else if (!isPowerOfTwo(M)) {
          errors.push("m debe ser potencia de 2 para este visualizador.");
        } else {
          G = Math.log2(M);
        }
      }
    } else {
      // p → g = log(p)/log(2), m = 2^g
      if (fields.p !== "") {
        const P = Number(fields.p);
        if (!isInt(P) || P <= 1) {
          errors.push("p debe ser entero > 1.");
        } else if (!isPowerOfTwo(P)) {
          errors.push("p debe ser potencia de 2 (para que g sea entero).");
        } else {
          G = Math.round(Math.log(P) / Math.log(2));
          M = 2 ** G; // con p potencia de 2, coincide
        }
      }
    }

    // c y seed (dependen de M)
    let C = NaN, S = NaN;
    if (fields.c !== "") {
      C = Number(fields.c);
      if (!isInt(C) || C <= 0) errors.push("c debe ser entero positivo (> 0).");
    }
    if (!Number.isNaN(M) && fields.seed !== "") {
      S = Number(fields.seed);
      if (!isInt(S) || S < 0 || S >= M) {
        errors.push(`seed (x₀) debe ser entero en [0, ${isNaN(M) ? "m-1" : M - 1}].`);
      }
    }

    // Reglas obligatorias cuando ya están todos
    if (![A, C, M, S].some(Number.isNaN)) {
      // c coprimo con m (obligatorio)
      if (gcd(C, M) !== 1) errors.push("gcd(c, m) debe ser 1 (c debe ser coprimo con m).");

      // Hull–Dobell (sugerencias)
      const ps = primeFactors(M);
      for (const p of ps) {
        if ((A - 1) % p !== 0) { hints.push(`Sugerencia: (a - 1) múltiplo de ${p} (primo de m).`); break; }
      }
      if (M % 4 === 0 && (A - 1) % 4 !== 0) hints.push("Sugerencia: como m es múltiplo de 4, (a - 1) múltiplo de 4.");
    }

    return {
      a: A, c: C, m: M, g: G, seed: S, decimals: D,
      errors, hints,
      ready: ![A, C, M, S, D].some(Number.isNaN) && errors.length === 0
    };
  }, [fields, modeA, modeM]);

  // Generar en tiempo real cuando ready
  const [gen, setGen] = useState(null);
  useEffect(() => {
    if (derived.ready) {
      setGen(generateFullPeriodAditivo({ a: derived.a, c: derived.c, m: derived.m, seed: derived.seed }));
    } else {
      setGen(null);
    }
  }, [derived]);

  const showDecimals = Number.isFinite(derived.decimals) ? derived.decimals : 0;

  return (
    <section className="card" style={{ maxWidth: 1100 }}>
      <h3 style={{ marginBottom: 12 }}>LCG Aditivo (c &gt; 0) — modos a/k y m:g/m/p</h3>

      {/* Sliders de modo */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 8 }}>
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Modo para definir a
          </label>
          <input
            type="range" min={0} max={1} step={1}
            value={modeA}
            onChange={(e) => setModeA(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4 }}>
            <span style={{ fontWeight: modeA === 0 ? 700 : 400 }}>Ingresar a</span>
            <span style={{ fontWeight: modeA === 1 ? 700 : 400 }}>Usar k → a = 1 + 4k</span>
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Modo para definir m
          </label>
          {/* 0=g, 1=m, 2=p */}
          <input
            type="range" min={0} max={2} step={1}
            value={modeM}
            onChange={(e) => setModeM(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4 }}>
            <span style={{ fontWeight: modeM === 0 ? 700 : 400 }}>g → m = 2^g</span>
            <span style={{ fontWeight: modeM === 1 ? 700 : 400 }}>m directo</span>
            <span style={{ fontWeight: modeM === 2 ? 700 : 400 }}>p → g = log(p)/log(2) → m</span>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form className="grid-form" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {modeA === 0 ? (
          <label> a (multiplicador)
            <input type="number" name="a" placeholder="p.ej. 13" value={fields.a} onChange={onField} />
          </label>
        ) : (
          <>
            <label> k (entero &gt; 0)
              <input type="number" name="k" placeholder="p.ej. 3" value={fields.k} onChange={onField} />
            </label>
            <div style={{ alignSelf: "end", fontSize: 14, opacity: .85 }}>
              a = 1 + 4k ⇒ <b>{fields.k !== "" && isInt(Number(fields.k)) && Number(fields.k) > 0 ? 1 + 4 * Number(fields.k) : "?"}</b>
            </div>
          </>
        )}

        <label> c (incremento) — debe ser &gt; 0 y coprimo con m
          <input type="number" name="c" placeholder="p.ej. 7" value={fields.c} onChange={onField} />
        </label>

        {modeM === 0 && (
          <>
            <label> g (exponente) → m = 2^g
              <input type="number" name="g" placeholder="p.ej. 4" value={fields.g} onChange={onField} />
            </label>
            <div style={{ alignSelf: "end", fontSize: 14, opacity: .85 }}>
              m = 2^g ⇒ <b>{fields.g !== "" && isInt(Number(fields.g)) ? 2 ** Number(fields.g) : "?"}</b>
            </div>
          </>
        )}

        {modeM === 1 && (
          <>
            <label> m (potencia de 2)
              <input type="number" name="m" placeholder="p.ej. 16" value={fields.m} onChange={onField} />
            </label>
            <div style={{ alignSelf: "end", fontSize: 14, opacity: .85 }}>
              g = log₂(m) ⇒ <b>{fields.m !== "" && isInt(Number(fields.m)) && isPowerOfTwo(Number(fields.m)) ? Math.log2(Number(fields.m)) : "?"}</b>
            </div>
          </>
        )}

        {modeM === 2 && (
          <>
            <label> p (potencia de 2)
              <input type="number" name="p" placeholder="p.ej. 16" value={fields.p} onChange={onField} />
            </label>
            <div style={{ alignSelf: "end", fontSize: 14, opacity: .85 }}>
              g = ln(p)/ln(2) ⇒ <b>{fields.p !== "" && isInt(Number(fields.p)) && isPowerOfTwo(Number(fields.p)) ? Math.round(Math.log(Number(fields.p)) / Math.log(2)) : "?"}</b>
              {" · "} m = 2^g ⇒ <b>{fields.p !== "" && isInt(Number(fields.p)) && isPowerOfTwo(Number(fields.p)) ? Number(fields.p) : "?"}</b>
            </div>
          </>
        )}

        <label> seed (x₀)
          <input type="number" name="seed" placeholder="p.ej. 5" value={fields.seed} onChange={onField} />
        </label>

        <label> decimales para rᵢ (rᵢ = Xᵢ / (m-1))
          <input type="number" name="decimals" placeholder="p.ej. 4" value={fields.decimals} onChange={onField} />
        </label>
      </form>

      {/* Estado a, m, g actuales */}
      <div style={{ marginTop: 8, fontSize: 14, opacity: 0.9 }}>
        <strong>a actual:</strong> {Number.isFinite(derived.a) ? derived.a : "—"}{" · "}
        <strong>m actual:</strong> {Number.isFinite(derived.m) ? derived.m : "—"}{" · "}
        <strong>g actual:</strong> {Number.isFinite(derived.g) ? derived.g : "—"}
      </div>

      {/* Errores / Sugerencias */}
      {derived.errors.length > 0 && (
        <div className="alert" style={{ marginTop: 12, color: "#b00020" }}>
          <strong>Errores:</strong>
          {derived.errors.map((er, i) => <div key={i}>• {er}</div>)}
        </div>
      )}
      {derived.hints.length > 0 && derived.errors.length === 0 && (
        <div className="alert" style={{ marginTop: 12, color: "#8a6d3b" }}>
          <strong>Sugerencias (Hull–Dobell):</strong>
          {derived.hints.map((h, i) => <div key={i}>• {h}</div>)}
        </div>
      )}

      {/* Resultados */}
      {gen && (
        <>
          <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <div>
              <h4>Valores crudos (Xi), incluyendo X₀</h4>
              <ol>{gen.raw.map((v, i) => <li key={i}>{v}</li>)}</ol>
            </div>
            <div>
              <h4>Normalizados (rᵢ = Xᵢ / (m-1)), con {showDecimals} decimales</h4>
              <ol>{gen.raw.map((x, i) => <li key={i}>{ui(x, gen.m, showDecimals)}</li>)}</ol>
            </div>
          </div>

          {/* Tabla detallada */}
          <div style={{ marginTop: 24 }}>
            <h4>Tabla de iteraciones (detalle de operación)</h4>
            <p style={{ marginTop: 4, fontSize: 14 }}>
              <strong>Nota:</strong> i=0 es la semilla X₀; i≥1 muestra la operación.
              Cambia <em>decimales</em> y los modos <em>a/k</em>, <em>g/m/p</em> para ver cambios en vivo.
            </p>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
              <thead>
                <tr>
                  <th style={th}>i</th>
                  <th style={th}>Xi-1 (entrada)</th>
                  <th style={th}>Operación (texto)</th>
                  <th style={th}>Valor sin módulo (a·Xi-1 + c)</th>
                  <th style={th}>m</th>
                  <th style={th}>Xi = (…) mod m</th>
                  <th style={th}>rᵢ = Xi / (m-1) (decimales={showDecimals})</th>
                  <th style={th}>Explicación breve</th>
                </tr>
              </thead>
              <tbody>
                {/* Semilla */}
                <tr>
                  <td style={td}>0</td>
                  <td style={td}>—</td>
                  <td style={td}>(semilla)</td>
                  <td style={td}>—</td>
                  <td style={td}>{gen.m}</td>
                  <td style={td}>{gen.raw[0]}</td>
                  <td style={td}>{ui(gen.raw[0], gen.m, showDecimals)}</td>
                  <td style={td}>Valor inicial X₀.</td>
                </tr>

                {gen.rows.map((r) => (
                  <tr key={r.i}>
                    <td style={td}>{r.i}</td>
                    <td style={td}>{r.prev}</td>
                    <td style={td}>{r.opText}</td>
                    <td style={td}>{r.opNoMod}</td>
                    <td style={td}>{r.m}</td>
                    <td style={td}>{r.xi}</td>
                    <td style={td}>{ui(r.xi, r.m, showDecimals)}</td>
                    <td style={td}>{r.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 12, fontSize: 14 }}>
              <strong>Resumen:</strong>{" "}
              período detectado = <b>{gen.period}</b>
              {" · "}m = {gen.m}
              {" · "}r<sub>min</sub> = {Math.min(...gen.raw.map(x => x / (gen.m - 1))).toFixed(showDecimals)}
              {" · "}r<sub>max</sub> = {Math.max(...gen.raw.map(x => x / (gen.m - 1))).toFixed(showDecimals)}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

/** -------------------- Estilos de tabla -------------------- */
const th = {
  textAlign: "left",
  borderBottom: "1px solid #ccc",
  padding: "8px 6px",
  background: "#f8f8f8",
  fontWeight: 600,
  fontSize: 14
};
const td = {
  borderBottom: "1px solid #eee",
  padding: "8px 6px",
  fontSize: 14
};
