import { NavLink } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    "nav__link" + (isActive ? " nav__link--active" : "");

  return (
    <header className="nav">
      <nav className="nav__inner">
        {/* Marca / Logo */}
        <div className="nav__brand">
          <span className="nav__logo">M&S</span>
          <span className="nav__title">Modelado & Simulación</span>
        </div>

        {/* Botón hamburguesa (mobile) */}
        <button
          className="nav__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Links */}
        <ul className={`nav__links ${open ? "is-open" : ""}`}>
          <li><NavLink to="/" className={linkClass} end>Inicio</NavLink></li>
          <li><NavLink to="/modulos/lcg" className={linkClass}>Generador LCG</NavLink></li>
          <li><NavLink to="/modulos/varianza" className={linkClass}>Varianza (próx.)</NavLink></li>
          <li><NavLink to="/modulos/colas" className={linkClass}>Colas (próx.)</NavLink></li>
          <li className="nav__spacer" />
          <li><NavLink to="/about" className={linkClass}>Acerca de</NavLink></li>
        </ul>
      </nav>
    </header>
  );
}
