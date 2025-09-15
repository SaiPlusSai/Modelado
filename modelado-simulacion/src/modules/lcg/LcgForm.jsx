import { Link } from "react-router-dom";

export default function LcgForm() {
  return (
    <div
      className="card"
      style={{
        maxWidth: 480,
        margin: "40px auto",
        padding: "24px 28px",
        borderRadius: 12,
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
        background: "#fff",
        textAlign: "center"
      }}
    >
      <h2 style={{ marginBottom: 12, fontSize: 22, fontWeight: 700 }}>
        Elige el tipo de generador
      </h2>
      <p style={{ color: "#555", marginBottom: 24, fontSize: 15, lineHeight: 1.5 }}>
        Usa el <strong>multiplicativo</strong> si <code>c = 0</code>.  
        Usa el <strong>aditivo</strong> si <code>c ≠ 0</code>.
      </p>

      <div
        className="btn-row"
        style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          flexWrap: "wrap"
        }}
      >
        <Link
          to="multiplicativo"
          className="btn"
          style={{
            flex: 1,
            minWidth: 140,
            padding: "12px 18px",
            borderRadius: 8,
            background: "#2563eb",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 15,
            transition: "background 0.2s"
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#1e40af")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#2563eb")}
        >
          Multiplicativo
        </Link>

        <Link
          to="aditivo"
          className="btn btn--alt"
          style={{
            flex: 1,
            minWidth: 140,
            padding: "12px 18px",
            borderRadius: 8,
            background: "#f3f4f6",
            color: "#111827",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 15,
            border: "1px solid #d1d5db",
            transition: "background 0.2s"
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#e5e7eb")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#f3f4f6")}
        >
          Aditivo
        </Link>
      </div>
    </div>
  );
}
