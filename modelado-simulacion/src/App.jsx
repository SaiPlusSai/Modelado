import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
// LCG
import LcgPage from "./modules/lcg/LcgPage";
import LcgForm from "./modules/lcg/LcgForm";
import LcgMultiplicativo from "./modules/lcg/LcgMultiplicativo";
import LcgAditivo from "./modules/lcg/LcgAditivo";


export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
          {/* RUTA PADRE */}
        <Route path="/modulos/lcg" element={<LcgPage />}>
          {/* index: muestra los dos botones */}
          <Route index element={<LcgForm />} />
          <Route path="multiplicativo" element={<LcgMultiplicativo />} />
          <Route path="aditivo" element={<LcgAditivo />} />
        </Route>
        <Route path="/modulos/varianza" element={<div style={{maxWidth:980,margin:"24px auto",padding:"0 16px"}}><h1>Varianza</h1><p>En construcción…</p></div>} />
        <Route path="/modulos/colas" element={<div style={{maxWidth:980,margin:"24px auto",padding:"0 16px"}}><h1>Teoría de Colas</h1><p>En construcción…</p></div>} />

        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
