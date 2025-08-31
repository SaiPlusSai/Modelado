import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import LcgPage from "./modules/lcg/LcgPage.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* módulos */}
        <Route path="/modulos/lcg" element={<LcgPage />} />
        {/* placeholders de futuros módulos */}
        <Route path="/modulos/varianza" element={<div style={{maxWidth:980,margin:"24px auto",padding:"0 16px"}}><h1>Varianza</h1><p>En construcción…</p></div>} />
        <Route path="/modulos/colas" element={<div style={{maxWidth:980,margin:"24px auto",padding:"0 16px"}}><h1>Teoría de Colas</h1><p>En construcción…</p></div>} />

        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
