import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    "nav__link" + (isActive ? " nav__link--active" : "");

  // Cierra con ESC (calidad de vida)
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeOnClick = () => setOpen(false);

  return (
    <header className="nav">
      <nav className="nav__inner">
        {/* Marca / Logo */}
        <div className="nav__brand">
          <span className="nav__logo" aria-hidden>MS</span>
          <span className="nav__title">Modelado & Simulación</span>
        </div>

        {/* Botón hamburguesa (mobile) */}
        <button
          className="nav__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="menu"
        >
          <span />
          <span />
          <span />
        </button>

        {/* Links */}
        <ul id="menu" className={`nav__links ${open ? "is-open" : ""}`}>
          <li><NavLink to="/" className={linkClass} end onClick={closeOnClick}>Inicio</NavLink></li>
          <li><NavLink to="/modulos/lcg" className={linkClass} onClick={closeOnClick}>Generador LCG</NavLink></li>
          <li className="nav__spacer" />
          <li><NavLink to="/about" className={linkClass} onClick={closeOnClick}>Acerca de</NavLink></li>
        </ul>
      </nav>
    </header>
  );
}
