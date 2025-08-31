import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main style={{ maxWidth: 980, margin: "24px auto", padding: "0 16px" }}>
      <h1>404</h1>
      <p>Página no encontrada.</p>
      <Link to="/">Volver al inicio</Link>
    </main>
  );
}
