import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Ventas from "./pages/Ventas";
import Variedades from "./pages/Variedades";
import Gastos from "./pages/Gastos";
import Categorias from "./pages/Categorias";
import Historial from "./pages/Historial";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="/variedades" element={<Variedades />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/historial" element={<Historial />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;