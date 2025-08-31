import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  padding: "8px 12px",
  borderRadius: 8,
  textDecoration: "none",
  color: isActive ? "#fff" : "#222",
  background: isActive ? "#1e88e5" : "transparent",
});

export default function Navbar() {
  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 10,
      background: "#f7f7f7",
      borderBottom: "1px solid #e5e5e5"
    }}>
      <nav style={{
        maxWidth: 1080,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px"
      }}>
        <div style={{ fontWeight: 700, marginRight: 12 }}>
          Modelado & Simulación
        </div>

        <NavLink to="/" style={linkStyle} end>Inicio</NavLink>

        {/* Módulos actuales */}
        <NavLink to="/modulos/lcg" style={linkStyle}>Generador LCG</NavLink>

        {/* Espacios reservados para futuros módulos */}
        <NavLink to="/modulos/varianza" style={linkStyle}>Varianza (próx.)</NavLink>
        <NavLink to="/modulos/colas" style={linkStyle}>Colas (próx.)</NavLink>

        <div style={{ marginLeft: "auto" }}>
          <NavLink to="/about" style={linkStyle}>Acerca de</NavLink>
        </div>
      </nav>
    </header>
  );
}
