export default function Home() {
  return (
    <main
      style={{
        maxWidth: 960,
        margin: "40px auto",
        padding: "0 20px",
        fontFamily: "system-ui, sans-serif",
        lineHeight: 1.6,
        background: "#111", // fondo general negro
        color: "#f9fafb", // texto principal claro
        minHeight: "100vh",
      }}
    >
      <section
        style={{
          background: "#1f1f1f", // gris muy oscuro
          padding: "32px 40px",
          borderRadius: 12,
          boxShadow: "0 6px 16px rgba(0,0,0,0.6)",
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 12,
            color: "#fff", // blanco total para títulos
          }}
        >
          Inicio
        </h1>
        <p
          style={{
            fontSize: 16,
            color: "#d1d5db", // gris claro para párrafos
            marginBottom: 20,
          }}
        >
          Bienvenido/a al laboratorio de{" "}
          <strong style={{ color: "#fff" }}>Variabilidad y Simulación</strong>.
          <br />
          Usa el <b style={{ color: "#facc15" }}>navbar</b> para navegar a los
          módulos. Empezamos con el{" "}
          <i style={{ color: "#93c5fd" }}>
            Generador Congruencial Lineal (LCG)
          </i>.
        </p>

        <ul
          style={{
            listStyle: "none",
            paddingLeft: 0,
            margin: 0,
            display: "grid",
            gap: 12,
          }}
        >
          {[
            "Resultados reproducibles con semillas.",
            "Normalización opcional.",
            "Estructura modular para agregar más modelos.",
          ].map((text, i) => (
            <li
              key={i}
              style={{
                background: "#18181b", // más oscuro para contraste
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid #27272a", // gris fuerte
                fontSize: 15,
                color: "#e5e7eb",
                transition: "background 0.2s, transform 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#27272a";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#18181b";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {text}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
