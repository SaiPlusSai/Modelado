import { Link } from "react-router-dom";

export default function LcgForm() {
  return (
    <div
      className="card"
      style={{
        maxWidth: 480,
        margin: "40px auto",
        padding: "28px 32px",
        borderRadius: 14,
        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
        background: "#0b0b0c",   // negro
        textAlign: "center",
        color: "#f9fafb",
      }}
    >
      <h2
        style={{
          marginBottom: 14,
          fontSize: 24,
          fontWeight: 700,
          color: "#fff",
        }}
      >
        Elige el tipo de generador
      </h2>

      <p
        style={{
          color: "#d1d5db",
          marginBottom: 28,
          fontSize: 15,
          lineHeight: 1.6,
        }}
      >
        Usa el <strong style={{ color: "#93c5fd" }}>multiplicativo</strong> si{" "}
        <code style={{ background: "#111", padding: "2px 6px", borderRadius: 4 }}>
          c = 0
        </code>
        . <br />
        Usa el <strong style={{ color: "#fbbf24" }}>aditivo</strong> si{" "}
        <code style={{ background: "#111", padding: "2px 6px", borderRadius: 4 }}>
          c ≠ 0
        </code>
        .
      </p>

      <div
        className="btn-row"
        style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Link
          to="multiplicativo"
          style={{
            flex: 1,
            minWidth: 140,
            padding: "12px 18px",
            borderRadius: 10,
            background: "#2563eb", // azul
            color: "#fff",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 15,
            transition: "all 0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "#1d4ed8")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "#2563eb")
          }
        >
          Multiplicativo
        </Link>

        <Link
          to="aditivo"
          style={{
            flex: 1,
            minWidth: 140,
            padding: "12px 18px",
            borderRadius: 10,
            background: "transparent",
            color: "#f9fafb",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 15,
            border: "2px solid #374151",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#111827";
            e.currentTarget.style.borderColor = "#4b5563";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "#374151";
          }}
        >
          Aditivo
        </Link>
      </div>
    </div>
  );
}
