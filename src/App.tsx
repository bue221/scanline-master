import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Fundamentos } from './pages/Fundamentos';
import { PasoAPaso } from './pages/PasoAPaso';
import { Historia } from './pages/Historia';
import { Laboratorio } from './pages/Laboratorio';
import { Aplicaciones } from './pages/Aplicaciones';

function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 space-y-4">
      <p className="text-6xl">🗺️</p>
      <h1 className="text-2xl font-bold text-slate-800">Página no encontrada</h1>
      <p className="text-slate-500">La ruta que buscas no existe.</p>
      <a href="/" className="text-indigo-600 hover:underline font-medium">
        Volver al inicio
      </a>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/fundamentos" element={<Fundamentos />} />
          <Route path="/simulador"   element={<PasoAPaso />} />
          <Route path="/historia"    element={<Historia />} />
          <Route path="/laboratorio"  element={<Laboratorio />} />
          <Route path="/aplicaciones" element={<Aplicaciones />} />
          <Route path="*"            element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
