import { Link } from "react-router-dom";

export default function LcgForm() {
  return (
    <div className="card">
      <h2 style={{ marginBottom: 8 }}>Elige el tipo de generador</h2>
      <p style={{ color: "var(--muted)", marginBottom: 16 }}>
        Usa el multiplicativo si <code>c = 0</code>. Usa el aditivo si <code>c ≠ 0</code>.
      </p>

      <div className="btn-row">
        <Link to="multiplicativo" className="btn">Multiplicativo</Link>
        <Link to="aditivo" className="btn btn--alt">Aditivo</Link>
      </div>
    </div>
  );
}
