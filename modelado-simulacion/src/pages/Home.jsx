export default function Home() {
  return (
    <main style={{ maxWidth: 980, margin: "24px auto", padding: "0 16px" }}>
      <h1>Inicio</h1>
      <p>
        Bienvenido/a al laboratorio de <b>Variabilidad y Simulación</b>. 
        Usa el navbar para navegar a los módulos. Empezamos con el <i>Generador Congruencial Lineal (LCG)</i>.
      </p>
      <ul>
        <li>Resultados reproducibles con semillas.</li>
        <li>Normalización opcional.</li>
        <li>Estructura modular para agregar más modelos.</li>
      </ul>
    </main>
  );
}
