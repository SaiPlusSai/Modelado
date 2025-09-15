import React, { useEffect, useMemo, useState, useRef } from "react";

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
/** r_i = X_i / (m-1) */
const ui = (x, m, decimals = 0) => (x / (m - 1)).toFixed(decimals);

/** -------------------- Motor (ADITIVO) -------------------- */
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
      opText: `(${a} × ${x} + ${c}) mod ${m}`,
      opNoMod,
      m,
      xi,
      explanation: "Multiplico Xᵢ₋₁ por a, sumo c y reduzco módulo m."
    });
    raw.push(xi);

    if (seen.has(xi)) { period = i - seen.get(xi); break; }
    seen.set(xi, i);
    x = xi;
  }
  if (period == null) period = Math.min(rows.length, m);
  return { raw, rows, period, m };
}

/** -------------------- Input numérico “amigable” -------------------- */
function NumericInput({ value, onChange, ...rest }) {
  const ref = useRef(null);

  // Evita que la rueda del mouse cambie el valor y provoque blur
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e) => {
      if (document.activeElement === el) {
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      value={value}
      onChange={(e) => {
        // permitimos vacío o sólo dígitos
        const v = e.target.value;
        if (v === "" || /^[0-9]+$/.test(v)) {
          onChange(e);
        }
      }}
      onKeyDown={(e) => {
        // Evitar que Enter dispare alguna submit implícita o cambie el foco
        if (e.key === "Enter") {
          e.preventDefault();
        }
      }}
      {...rest}
    />
  );
}

/** -------------------- Componente -------------------- */
export default function LcgAditivo() {
  /**
   * modeA: 0 = ingresar a, 1 = usar k (a = 1 + 4k)
   * modeM: 0 = usar g (m = 2^g), 1 = ingresar m directo, 2 = usar p (g = log(p)/log(2); m = 2^g)
   */
  const [modeA, setModeA] = useState(0);
  const [modeM, setModeM] = useState(0);

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

  /** ---------- Derivados + validaciones (manteniendo reglas, seed > 0) ---------- */
  const derived = useMemo(() => {
    const errors = [];
    const hints = [];

    // decimales
    const D = fields.decimals === "" ? NaN : Number(fields.decimals);
    if (!Number.isNaN(D) && (!isInt(D) || D < 0 || D > 10)) {
      errors.push("decimales debe ser entero entre 0 y 10.");
    }

    // a (directo o via k)
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

    // m/g/p
    let M = NaN, G = NaN;
    if (modeM === 0) {
      if (fields.g !== "") {
        G = Number(fields.g);
        if (!isInt(G) || G < 2 || G > 31) {
          errors.push("g debe ser entero entre 2 y 31 (m = 2^g).");
        } else {
          M = 2 ** G;
        }
      }
    } else if (modeM === 1) {
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
      if (fields.p !== "") {
        const P = Number(fields.p);
        if (!isInt(P) || P <= 1) {
          errors.push("p debe ser entero > 1.");
        } else if (!isPowerOfTwo(P)) {
          errors.push("p debe ser potencia de 2 (para que g sea entero).");
        } else {
          G = Math.round(Math.log(P) / Math.log(2));
          M = 2 ** G;
        }
      }
    }

    // c y seed (> 0, sin depender de m)
    let C = NaN, S = NaN;
    if (fields.c !== "") {
      C = Number(fields.c);
      if (!isInt(C) || C <= 0) errors.push("c debe ser entero positivo (> 0).");
    }
    if (fields.seed !== "") {
      S = Number(fields.seed);
      if (!isInt(S) || S <= 0) {
        errors.push("seed (X₀) debe ser un entero > 0.");
      }
    }

    // Sugerencias Hull–Dobell (hints)
    if (![A, C, M, S].some(Number.isNaN)) {
      if (gcd(C, M) !== 1) errors.push("gcd(c, m) debe ser 1 (c debe ser coprimo con m).");
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

  /** ---------- Generación en vivo + último buen resultado ---------- */
  const [gen, setGen] = useState(null);
  const [lastGoodGen, setLastGoodGen] = useState(null);

  useEffect(() => {
    if (derived.ready) {
      const next = generateFullPeriodAditivo({ a: derived.a, c: derived.c, m: derived.m, seed: derived.seed });
      setGen(next);
      setLastGoodGen(next);
    } else {
      // mantenemos el último bueno visible (no perdés la tabla mientras tipeás)
      setGen(null);
    }
  }, [derived]);

  const showDecimals = Number.isFinite(derived.decimals) ? derived.decimals : 0;

  /** ---------- Helpers UI (paleta negra) ---------- */
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

const Control = ({ label, hint, after, value, onChange, ...rest }) => (
  <label style={{ display: "block", color: "#f5f6f8" }}>
    <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
    <NumericInput
      value={value}
      onChange={onChange}
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
    const g = gen ?? lastGoodGen;
    if (!g) return;
    const header = ["i","Xi-1","Operación","a·Xi-1 + c","m","Xi","r_i (m-1)"].join("\t");
    const lines = g.rows.map(r => [
      r.i, r.prev, r.opText, r.opNoMod, r.m, r.xi, ui(r.xi, r.m, showDecimals)
    ].join("\t"));
    const seed = `0\t—\t(semilla)\t—\t${g.m}\t${g.raw[0]}\t${ui(g.raw[0], g.m, showDecimals)}`;
    const tsv = [header, seed, ...lines].join("\n");
    navigator.clipboard.writeText(tsv);
  };

  const clearAll = () => {
    setFields({ a:"", k:"", c:"", g:"", m:"", p:"", seed:"", decimals:"" });
  };

  const gShown = gen ?? lastGoodGen;

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: 12 }}>
      {/* Encabezado amigable */}
      <header style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Generador Congruencial Lineal — <span style={{ fontWeight: 400 }}>ADITIVO (c ≠ 0)</span></h2>
        <div style={{ fontSize: 13, opacity: .85, marginTop: 6 }}>
          Completa los pasos de izquierda a derecha. Los resultados aparecen abajo en tiempo real.
          {badge("rᵢ = Xᵢ / (m − 1)")}
          {badge("m = 2^g")}
          {badge("a = 1 + 4k (opcional)")}
        </div>
      </header>

      {/* Paso 1: a / k */}
      <Section
        title="1) Multiplicador a"
        subtitle="Elige si quieres escribir a directamente o calcularlo con k (a = 1 + 4k)."
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <Pill active={modeA === 0} onClick={() => setModeA(0)}>Ingresar a</Pill>
            <Pill active={modeA === 1} onClick={() => setModeA(1)}>Usar k → a = 1 + 4k</Pill>
          </div>
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {modeA === 0 ? (
            <Control
              label="a (entero > 0)"
              name="a"
              placeholder="Ej.: 13"
              value={fields.a}
              onChange={onField}
              hint="Escribe el valor de a directamente."
            />
          ) : (
            <>
              <Control
                label="k (entero > 0)"
                name="k"
                placeholder="Ej.: 3"
                value={fields.k}
                onChange={onField}
                hint="Usamos a = 1 + 4k."
                after={badge(`a = ${fields.k && isInt(Number(fields.k)) && Number(fields.k)>0 ? 1+4*Number(fields.k) : "?"}`)}
              />
              <div />
              <div />
            </>
          )}
        </div>
      </Section>

      {/* Paso 2: m por g / m directo / p */}
      <Section
        title="2) Módulo m"
        subtitle="Define m usando g (m = 2^g), m directo, o p (g = ln(p)/ln(2) → m)."
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
              placeholder="Ej.: 4 → m = 16"
              value={fields.g}
              onChange={onField}
              hint="m = 2^g"
              after={badge(`m = ${fields.g && isInt(Number(fields.g)) ? 2 ** Number(fields.g) : "?"}`)}
            />
          )}

          {modeM === 1 && (
            <Control
              label="m (potencia de 2)"
              name="m"
              placeholder="Ej.: 16, 32, 64…"
              value={fields.m}
              onChange={onField}
              hint="Si m es potencia de 2, g = log₂(m)."
              after={badge(`g = ${fields.m && isInt(Number(fields.m)) && isPowerOfTwo(Number(fields.m)) ? Math.log2(Number(fields.m)) : "?"}`)}
            />
          )}

          {modeM === 2 && (
            <Control
              label="p (potencia de 2)"
              name="p"
              placeholder="Ej.: 16"
              value={fields.p}
              onChange={onField}
              hint="Calculamos g = ln(p)/ln(2) y luego m = 2^g."
              after={
                <>
                  {badge(`g = ${fields.p && isInt(Number(fields.p)) && isPowerOfTwo(Number(fields.p)) ? Math.round(Math.log(Number(fields.p))/Math.log(2)) : "?"}`)}
                  {badge(`m = ${fields.p && isInt(Number(fields.p)) && isPowerOfTwo(Number(fields.p)) ? Number(fields.p) : "?"}`)}
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

      {/* Paso 3: c, semilla (>0), decimales */}
      <Section
        title="3) Incremento, semilla y formato"
        subtitle="Completa c (coprimo con m), la semilla X₀ (> 0), y cuántos decimales mostrar para rᵢ."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          <Control
            label="c (incremento > 0, coprimo con m)"
            name="c"
            placeholder="Ej.: 7"
            value={fields.c}
            onChange={onField}
            hint="Para buen periodo: gcd(c, m) = 1."
          />
          <Control
            label="Semilla X₀ (> 0)"
            name="seed"
            placeholder="Ej.: 5, 12, 123456…"
            value={fields.seed}
            onChange={onField}
            hint="Cualquier entero > 0."
          />
          <Control
            label="Decimales para rᵢ"
            name="decimals"
            placeholder="Ej.: 4"
            value={fields.decimals}
            onChange={onField}
            hint="rᵢ = Xᵢ / (m − 1)"
          />
        </div>

        {/* Acciones */}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <Button tone="primary" type="button">
            Generar (en vivo)
          </Button>
          <Button type="button" onClick={clearAll}>Limpiar</Button>
          <Button type="button" onClick={copyTable} disabled={!(gen ?? lastGoodGen)}>Copiar tabla</Button>
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
          <strong>Sugerencias (Hull–Dobell):</strong>
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

      {/* Resultados (si hay algo válido, mostramos el último bueno) */}
      {gShown && (
        <Section
          title="Resultados"
          subtitle="Debajo verás la secuencia cruda Xᵢ, los normalizados rᵢ = Xᵢ/(m−1) y la tabla paso a paso."
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <h4 style={{ marginTop: 0 }}>Valores crudos (Xᵢ), incluyendo X₀</h4>
              <ol style={{ paddingLeft: 20 }}>
                {gShown.raw.map((v, i) => <li key={i}>{v}</li>)}
              </ol>
            </div>
            <div>
              <h4 style={{ marginTop: 0 }}>Normalizados (rᵢ = Xᵢ / (m − 1)), con {showDecimals} decimales</h4>
              <ol style={{ paddingLeft: 20 }}>
                {gShown.raw.map((x, i) => <li key={i}>{ui(x, gShown.m, showDecimals)}</li>)}
              </ol>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <h4 style={{ marginTop: 0 }}>Tabla de iteraciones</h4>
            <div style={{ fontSize: 13, opacity: .8, marginBottom: 6 }}>
              i=0 es la semilla X₀; i≥1 aplica Xᵢ = (a·Xᵢ₋₁ + c) mod m.
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>i</th>
                  <th style={th}>Xᵢ₋₁ (entrada)</th>
                  <th style={th}>Operación</th>
                  <th style={th}>a·Xᵢ₋₁ + c (sin módulo)</th>
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
                  <td style={td}>{gShown.m}</td>
                  <td style={td}>{gShown.raw[0]}</td>
                  <td style={td}>{ui(gShown.raw[0], gShown.m, showDecimals)}</td>
                  <td style={td}>Valor inicial X₀.</td>
                </tr>
                {gShown.rows.map((r) => (
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
              período detectado = <b>{gShown.period}</b>
              {" · "}m = {gShown.m}
              {" · "}r<sub>min</sub> = {Math.min(...gShown.raw.map(x => x / (gShown.m - 1))).toFixed(showDecimals)}
              {" · "}r<sub>max</sub> = {Math.max(...gShown.raw.map(x => x / (gShown.m - 1))).toFixed(showDecimals)}
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

/** -------------------- Estilos de tabla (oscuro) -------------------- */
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