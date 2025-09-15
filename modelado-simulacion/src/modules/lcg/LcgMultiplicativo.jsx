import React, { useEffect, useMemo, useState } from "react";

/** -------------------- Utils -------------------- */
const isInt = (v) => Number.isInteger(v);
const isPowerOfTwo = (m) => m > 0 && (m & (m - 1)) === 0;
/** r_i = X_i / (m − 1) */
const ui = (x, m, decimals = 0) => (x / (m - 1)).toFixed(decimals);
/** permite "" y sólo dígitos ("5","54"), sin signos ni puntos */
const isDigits = (s) => /^\d+$/.test(s);

/** -------------------- Motor (MULTIPLICATIVO) -------------------- */
/** Xᵢ = (a·Xᵢ₋₁) mod m  (c = 0) */
function generateMultiplicativo({ a, m, seed }) {
  const raw = [seed];
  const rows = [];
  const seen = new Map();
  seen.set(seed, 0);

  let x = seed;
  let period = null;

  for (let i = 1; i <= m; i++) {
    const opNoMod = a * x;
    const xi = ((opNoMod % m) + m) % m;
    rows.push({
      i,
      prev: x,
      opText: `(${a} × ${x}) mod ${m}`,
      opNoMod,
      m,
      xi,
      explanation: "Multiplico Xᵢ₋₁ por a y reduzco módulo m."
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
export default function LcgMultiplicativo() {
  /**
   * formulaA: 0 => a = 8k + 3 ; 1 => a = 8k + 5
   * modeM: 0 = usar g (m = 2^g), 1 = m directo (pot. 2), 2 = p (pot. 2) → g → m
   */
  const [formulaA, setFormulaA] = useState(0);
  const [modeM, setModeM] = useState(0);

  const [fields, setFields] = useState({
    k: "",
    g: "", m: "", p: "",
    seed: "",
    decimals: ""
  });

  const onField = (e) => {
    const { name, value } = e.target;
    if (value === "" || isDigits(value)) setFields((p) => ({ ...p, [name]: value }));
  };

  /** ---------- Derivados + validaciones (UX suave) ---------- */
  const derived = useMemo(() => {
    const errors = [];
    const hints = [];

    // decimales
    let D = NaN;
    if (fields.decimals !== "") {
      if (isDigits(fields.decimals)) {
        D = Number(fields.decimals);
        if (!isInt(D) || D < 0 || D > 10) errors.push("decimales debe ser entero entre 0 y 10.");
      }
    }

    // a desde k y fórmula elegida
    let A = NaN;
    if (fields.k !== "") {
      if (isDigits(fields.k)) {
        const K = Number(fields.k);
        if (!isInt(K) || K <= 0) {
          errors.push("k debe ser entero positivo.");
        } else {
          A = (formulaA === 0) ? (8 * K + 3) : (8 * K + 5);
        }
      }
    }

    // m/g/p
    let M = NaN, G = NaN;
    if (modeM === 0) {
      if (fields.g !== "") {
        if (isDigits(fields.g)) {
          G = Number(fields.g);
          if (!isInt(G) || G < 2 || G > 31) {
            errors.push("g debe ser entero entre 2 y 31 (m = 2^g).");
          } else {
            M = 2 ** G;
          }
        }
      }
    } else if (modeM === 1) {
      if (fields.m !== "") {
        if (isDigits(fields.m)) {
          M = Number(fields.m);
          if (!isInt(M) || M <= 1) {
            errors.push("m debe ser entero > 1.");
          } else if (!isPowerOfTwo(M)) {
            errors.push("m debe ser potencia de 2.");
          } else {
            G = Math.log2(M);
          }
        }
      }
    } else {
      if (fields.p !== "") {
        if (isDigits(fields.p)) {
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
    }

    // seed (validamos cuando hay M)
    // seed: solo validamos que sea impar
let S = NaN;
if (fields.seed !== "") {
  if (isDigits(fields.seed)) {
    S = Number(fields.seed);
    if (!isInt(S)) {
      errors.push("seed (x₀) debe ser un entero.");
    } else if (S % 2 === 0) {
      errors.push("seed (x₀) debe ser IMPAR.");
    }
  }
}

    // Tips de período (si está todo listo)
    if (![A, M, S, D].some(Number.isNaN)) {
      const aMod8 = ((A % 8) + 8) % 8;
      if (aMod8 === 3 || aMod8 === 5) {
        hints.push("OK: a ≡ 3 ó 5 (mod 8). Período máx. sobre impares ≈ 2^{g-2}.");
      } else {
        hints.push("Mejor elegí a ≡ 3 ó 5 (mod 8) para buen período con m = 2^g.");
      }
    }

    return {
      a: A, m: M, g: G, seed: S, decimals: D,
      errors, hints,
      ready: ![A, M, S, D].some(Number.isNaN) && errors.length === 0
    };
  }, [fields, formulaA, modeM]);

  /** ---------- Generación en vivo ---------- */
  const [gen, setGen] = useState(null);
  useEffect(() => {
    if (derived.ready) {
      setGen(generateMultiplicativo({ a: derived.a, m: derived.m, seed: derived.seed }));
    } else {
      setGen(null);
    }
  }, [derived]);

  const showDecimals = Number.isFinite(derived.decimals) ? derived.decimals : 0;

 /** ---------- Helpers UI (mismo diseño, paleta negra) ---------- */
const badge = (text) => (
  <span style={{
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    background: "#0f1115",
    border: "1px solid #23262d",
    color: "#e5e7eb",
    marginLeft: 6
  }}>{text}</span>
);

const Section = ({ title, subtitle, children, right }) => (
  <section style={{
    border: "1px solid #1f2430",
    borderRadius: 14,
    padding: 14,
    background: "#111317",
    boxShadow: "0 2px 10px rgba(0,0,0,.35)",
    marginBottom: 12,
    color: "#f5f6f8"
  }}>
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
      <h4 style={{ margin: 0, fontSize: 16, color: "#ffffff" }}>{title}</h4>
      {right}
    </div>
    {subtitle && <div style={{ fontSize: 13, color: "#9aa1ac", marginTop: 4 }}>{subtitle}</div>}
    <div style={{ marginTop: 10 }}>{children}</div>
  </section>
);

const Control = ({ label, hint, after, ...rest }) => (
  <label style={{ display: "block", color: "#f5f6f8" }}>
    <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
    <input
      {...rest}
      style={{
        width: "100%",
        background: "#0c0e12",
        color: "#e7e9ee",
        border: "1px solid #2a2f3a",
        borderRadius: 10,
        padding: "10px 12px",
        outline: "none",
        boxShadow: "0 1px 0 rgba(0,0,0,.2)"
      }}
    />
    {(hint || after) && (
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
        {hint && <div style={{ fontSize: 12, color: "#9aa1ac" }}>{hint}</div>}
        {after}
      </div>
    )}
  </label>
);

const Pill = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      padding: "8px 12px",
      borderRadius: 999,
      border: `1px solid ${active ? "#000000" : "#2a2f3a"}`,
      background: active ? "#000000" : "transparent",
      color: active ? "#ffffff" : "#f5f6f8",
      cursor: "pointer",
      fontSize: 13
    }}
  >
    {children}
  </button>
);

const Button = ({ children, tone="default", ...props }) => (
  <button
    {...props}
    style={{
      padding: "10px 14px",
      borderRadius: 10,
      border: tone === "primary" ? "1px solid transparent" : "1px solid #2a2f3a",
      cursor: "pointer",
      fontWeight: 700,
      background: tone === "primary" ? "#000000" : "transparent",
      color: tone === "primary" ? "#ffffff" : "#e7e9ee",
      boxShadow: tone === "primary" ? "0 2px 8px rgba(0,0,0,.45)" : "none"
    }}
    onMouseOver={(e) => {
      if (tone === "primary") e.currentTarget.style.background = "#0a0a0a";
    }}
    onMouseOut={(e) => {
      if (tone === "primary") e.currentTarget.style.background = "#000000";
    }}
  >
    {children}
  </button>
);
  const copyTable = () => {
    if (!gen) return;
    const header = ["i","Xi-1","Operación","a·Xi-1 (sin módulo)","m","Xi","r_i (m-1)"].join("\t");
    const lines = gen.rows.map(r => [
      r.i, r.prev, r.opText, r.opNoMod, r.m, r.xi, ui(r.xi, r.m, showDecimals)
    ].join("\t"));
    const seed = `0\t—\t(semilla)\t—\t${gen.m}\t${gen.raw[0]}\t${ui(gen.raw[0], gen.m, showDecimals)}`;
    const tsv = [header, seed, ...lines].join("\n");
    navigator.clipboard.writeText(tsv);
  };

  const clearAll = () => {
    setFields({ k:"", g:"", m:"", p:"", seed:"", decimals:"" });
    setFormulaA(0);
    setModeM(0);
  };

  /** ---------- Render ---------- */
  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: 12 }}>
      {/* Encabezado */}
      <header style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>
          Generador Congruencial Lineal — <span style={{ fontWeight: 400 }}>MULTIPLICATIVO (c = 0)</span>
        </h2>
        <div style={{ fontSize: 13, opacity: .85, marginTop: 6 }}>
          Sigue los pasos de izquierda a derecha. Resultados abajo en tiempo real.
          {badge("rᵢ = Xᵢ / (m − 1)")}
          {badge("m = 2^g")}
          {badge("a = 8k + 3 ó 8k + 5")}
          {badge("seed impar")}
        </div>
      </header>

      {/* Paso 1: a mediante k (dos fórmulas) */}
      <Section
        title="1) Multiplicador a"
        subtitle="Elige la fórmula de a y escribe k (a = 8k + 3 ó a = 8k + 5)."
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <Pill active={formulaA === 0} onClick={() => setFormulaA(0)}>a = 8k + 3</Pill>
            <Pill active={formulaA === 1} onClick={() => setFormulaA(1)}>a = 8k + 5</Pill>
          </div>
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          <Control
            label="k (entero > 0)"
            name="k"
            type="text"
            inputMode="numeric"
            pattern="\d*"
            placeholder="Ej.: 3"
            value={fields.k}
            onChange={onField}
            hint="Calculamos a automáticamente según la fórmula elegida."
            after={badge(`a = ${
              fields.k && isDigits(fields.k) && Number(fields.k) > 0
                ? (formulaA === 0 ? 8 * Number(fields.k) + 3 : 8 * Number(fields.k) + 5)
                : "?"
            }`)}
          />
          <div />
          <div />
        </div>
      </Section>

      {/* Paso 2: m por g / m directo / p */}
      <Section
        title="2) Módulo m"
        subtitle="Define m usando g (m = 2^g), m directo, o p (potencia de 2)."
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <Pill active={modeM === 0} onClick={() => setModeM(0)}>Con g</Pill>
            <Pill active={modeM === 1} onClick={() => setModeM(1)}>m directo</Pill>
            <Pill active={modeM === 2} onClick={() => setModeM(2)}>Con p</Pill>
          </div>
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {modeM === 0 && (
            <Control
              label="g (entero 2–31)"
              name="g"
              type="text"
              inputMode="numeric"
              pattern="\d*"
              placeholder="Ej.: 4 → m = 16"
              value={fields.g}
              onChange={onField}
              hint="m = 2^g"
              after={badge(`m = ${fields.g && isDigits(fields.g) ? 2 ** Number(fields.g) : "?"}`)}
            />
          )}

          {modeM === 1 && (
            <Control
              label="m (potencia de 2)"
              name="m"
              type="text"
              inputMode="numeric"
              pattern="\d*"
              placeholder="Ej.: 16, 32, 64…"
              value={fields.m}
              onChange={onField}
              hint="Si m es potencia de 2, g = log₂(m)."
              after={badge(`g = ${
                fields.m && isDigits(fields.m) && isPowerOfTwo(Number(fields.m))
                  ? Math.log2(Number(fields.m))
                  : "?"
              }`)}
            />
          )}

          {modeM === 2 && (
            <Control
              label="p (potencia de 2)"
              name="p"
              type="text"
              inputMode="numeric"
              pattern="\d*"
              placeholder="Ej.: 16"
              value={fields.p}
              onChange={onField}
              hint="Calculamos g = ln(p)/ln(2) y luego m = 2^g."
              after={
                <>
                  {badge(`g = ${
                    fields.p && isDigits(fields.p) && isPowerOfTwo(Number(fields.p))
                      ? Math.round(Math.log(Number(fields.p))/Math.log(2))
                      : "?"
                  }`)}
                  {badge(`m = ${
                    fields.p && isDigits(fields.p) && isPowerOfTwo(Number(fields.p))
                      ? Number(fields.p)
                      : "?"
                  }`)}
                </>
              }
            />
          )}
        </div>

        <div style={{ marginTop: 8, fontSize: 14 }}>
          <strong>Vista previa:</strong>{" "}
          a = <b>{Number.isFinite(derived.a) ? derived.a : "—"}</b> ·{" "}
          m = <b>{Number.isFinite(derived.m) ? derived.m : "—"}</b> ·{" "}
          g = <b>{Number.isFinite(derived.g) ? derived.g : "—"}</b>
        </div>
      </Section>

      {/* Paso 3: seed impar y decimales */}
      <Section
        title="3) Semilla y formato"
        subtitle="Semilla X₀ en [1, m−1], IMPAR cuando m = 2^g. Decimales para rᵢ opcional."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          <Control
            label="Semilla X₀ (impar)"
            name="seed"
            type="text"
            inputMode="numeric"
            pattern="\d*"
            placeholder="Ej.: 5"
            value={fields.seed}
            onChange={onField}
            hint="Para m = 2^g, usa X₀ impar (y ≠ 0)."
          />
          <Control
            label="Decimales para rᵢ"
            name="decimals"
            type="text"
            inputMode="numeric"
            pattern="\d*"
            placeholder="Ej.: 4"
            value={fields.decimals}
            onChange={onField}
            hint="rᵢ = Xᵢ / (m − 1)"
          />
          <div />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <Button tone="primary" type="button" onClick={() => { /* generación es en vivo */ }}>
            Generar (en vivo)
          </Button>
          <Button type="button" onClick={clearAll}>Limpiar</Button>
          <Button type="button" onClick={copyTable} disabled={!gen}>Copiar tabla</Button>
        </div>
      </Section>

      {/* Hints / Errores */}
      {derived.hints.length > 0 && derived.errors.length === 0 && (
        <div style={{
          border: "1px solid #fde68a",
          background: "#fffbeb",
          color: "#92400e",
          borderRadius: 12,
          padding: 10,
          marginTop: 8
        }}>
          <strong>Tips de período (m = 2^g):</strong>
          {derived.hints.map((h, i) => <div key={i}>• {h}</div>)}
        </div>
      )}

      {derived.errors.length > 0 && (
        <div style={{
          border: "1px solid #fecaca",
          background: "#fef2f2",
          color: "#991b1b",
          borderRadius: 12,
          padding: 10,
          marginTop: 8
        }}>
          <strong>Revisa los campos:</strong>
          {derived.errors.map((er, i) => <div key={i}>• {er}</div>)}
        </div>
      )}

      {/* Resultados */}
      {gen && (
        <Section
          title="Resultados"
          subtitle="Secuencia Xᵢ, normalizados rᵢ = Xᵢ/(m−1) y tabla paso a paso."
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <h4 style={{ marginTop: 0 }}>Valores crudos (Xᵢ), incluyendo X₀</h4>
              <ol style={{ paddingLeft: 20 }}>
                {gen.raw.map((v, i) => <li key={i}>{v}</li>)}
              </ol>
            </div>
            <div>
              <h4 style={{ marginTop: 0 }}>Normalizados (rᵢ = Xᵢ / (m − 1)), con {showDecimals} decimales</h4>
              <ol style={{ paddingLeft: 20 }}>
                {gen.raw.map((x, i) => <li key={i}>{ui(x, gen.m, showDecimals)}</li>)}
              </ol>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <h4 style={{ marginTop: 0 }}>Tabla de iteraciones</h4>
            <div style={{ fontSize: 13, opacity: .8, marginBottom: 6 }}>
              i=0 es la semilla X₀; i≥1 aplica Xᵢ = (a·Xᵢ₋₁) mod m.
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>i</th>
                  <th style={th}>Xᵢ₋₁ (entrada)</th>
                  <th style={th}>Operación</th>
                  <th style={th}>a·Xᵢ₋₁ (sin módulo)</th>
                  <th style={th}>m</th>
                  <th style={th}>Xᵢ</th>
                  <th style={th}>rᵢ = Xᵢ/(m−1)</th>
                  <th style={th}>Nota</th>
                </tr>
              </thead>
              <tbody>
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

            <div style={{ marginTop: 10, fontSize: 14 }}>
              <strong>Resumen:</strong>{" "}
              período detectado = <b>{gen.period}</b>
              {" · "}m = {gen.m}
              {" · "}r<sub>min</sub> = {Math.min(...gen.raw.map(x => x / (gen.m - 1))).toFixed(showDecimals)}
              {" · "}r<sub>max</sub> = {Math.max(...gen.raw.map(x => x / (gen.m - 1))).toFixed(showDecimals)}
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

/** ---------- Estilos de tabla (oscuro) ---------- */
const th = {
  textAlign: "left",
  borderBottom: "1px solid #2a2f3a",
  padding: "10px 8px",
  background: "#0c0e12",
  fontWeight: 700,
  fontSize: 13,
  color: "#f5f6f8"
};
const td = {
  borderBottom: "1px solid #1f2430",
  padding: "10px 8px",
  fontSize: 13,
  color: "#e7e9ee"
};