import LcgForm from "./LcgForm";

export default function LcgPage() {
  return (
    <main style={{ maxWidth: 980, margin: "24px auto", padding: "0 16px" }}>
      <h1>Generador Congruencial Lineal (LCG)</h1>
      <p style={{ color: "#555" }}>
        Implementación equivalente a tu código en C++ con opción de usar o no el incremento <code>c</code>.
      </p>
      <LcgForm />
    </main>
  );
}
