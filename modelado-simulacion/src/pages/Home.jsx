export default function Home() {
  return (
    <main
      style={{
        maxWidth: 960,
        margin: "40px auto",
        padding: "0 20px",
        fontFamily: "system-ui, sans-serif",
        lineHeight: 1.6,
      }}
    >
      <section
        style={{
          background: "#fff",
          padding: "32px 40px",
          borderRadius: 12,
          boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 12,
            color: "#111827",
          }}
        >
          Inicio
        </h1>
        <p style={{ fontSize: 16, color: "#374151", marginBottom: 20 }}>
          Bienvenido/a al laboratorio de{" "}
          <strong>Variabilidad y Simulación</strong>.  
          Usa el <b>navbar</b> para navegar a los módulos. Empezamos con el{" "}
          <i>Generador Congruencial Lineal (LCG)</i>.
        </p>

        <ul
          style={{
            listStyle: "none",
            paddingLeft: 0,
            margin: 0,
            display: "grid",
            gap: 10,
          }}
        >
          <li
            style={{
              background: "#f9fafb",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 15,
            }}
          >
            Resultados reproducibles con semillas.
          </li>
          <li
            style={{
              background: "#f9fafb",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 15,
            }}
          >
            Normalización opcional.
          </li>
          <li
            style={{
              background: "#f9fafb",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 15,
            }}
          >
            Estructura modular para agregar más modelos.
          </li>
        </ul>
      </section>
    </main>
  );
}
