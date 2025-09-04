import { useState } from "react";
import { lcgSequence } from "../../lib/lcg";
import { validateParams } from "../../lib/validate";

export default function LcgMultiplicativo() {
  const [params, setParams] = useState({ a: 13, m: 8, seed: 5, n: 9 });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setParams((p) => ({ ...p, [name]: Number(value) }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const check = validateParams({ ...params, c: 0 });
    if (check.length) { setErrors(check); setResult(null); return; }
    setErrors([]);

    const seq = lcgSequence({
      a: params.a, c: 0, m: params.m, seed: params.seed, n: params.n, normalized: true
    });
    setResult(seq);
  };

  return (
    <section className="card">
      <h3 style={{ marginBottom: 12 }}>LCG Multiplicativo (c = 0)</h3>
      <form onSubmit={onSubmit} className="grid-form">
        <label> a
          <input type="number" name="a" value={params.a} onChange={onChange} />
        </label>
        <label> m
          <input type="number" name="m" value={params.m} onChange={onChange} />
        </label>
        <label> seed (x₀)
          <input type="number" name="seed" value={params.seed} onChange={onChange} />
        </label>
        <label> n
          <input type="number" name="n" value={params.n} onChange={onChange} />
        </label>
        <button type="submit" className="btn" style={{ gridColumn: "1 / -1" }}>Generar</button>
      </form>

      {errors.length > 0 && (
        <div className="alert">
          {errors.map((er, i) => <div key={i}>• {er}</div>)}
        </div>
      )}

      {result && (
        <div className="grid-2">
          <div>
            <h4>Valores crudos (co)</h4>
            <ol>{result.raw.map((v, i) => <li key={i}>{v}</li>)}</ol>
          </div>
          <div>
            <h4>Normalizados r = co / (m - 1)</h4>
            <ol>{result.normalized.map((v, i) => <li key={i}>{v}</li>)}</ol>
          </div>
        </div>
      )}
    </section>
  );
}
