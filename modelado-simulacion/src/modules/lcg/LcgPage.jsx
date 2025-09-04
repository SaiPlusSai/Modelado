import { Outlet } from "react-router-dom";

export default function LcgPage() {
  return (
    <main style={{ maxWidth: 1080, margin: "24px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 8 }}>Generador Congruencial Lineal (LCG)</h1>
      <p style={{ color: "var(--muted)", marginBottom: 16 }}>
        Elige una variante o completa el formulario para generar la secuencia.
      </p>
      <Outlet />
    </main>
  );
}
