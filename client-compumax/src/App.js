// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import Login from "./pages/Login";
import Clientes from "./pages/Clientes";
import Sucursales from "./pages/Sucursales";
import Servicios from "./pages/Servicios";
import RadiosAntenas from "./pages/RadiosAntenas";
import RouterSwitch from "./pages/RouterSwitch";
import CamarasIP from "./pages/CamarasIP";
import Dashboard from "./pages/dashboard";

// 🔒 Ruta privada (solo accesible si hay token)
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false); // 👈 estado para menú móvil

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <Router>
      {/* 🔗 Barra de navegación */}
      <nav className="bg-gray-800 text-white px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">Compumax</div>

          {/* Links en desktop */}
          {user && (
            <div className="hidden md:flex gap-4">
              <Link to="/clientes" className="hover:text-blue-300">
                Clientes
              </Link>
              <Link to="/sucursales" className="hover:text-blue-300">
                Sucursales
              </Link>
              <Link to="/servicios" className="hover:text-blue-300">
                Servicios
              </Link>
              <Link to="/radios_antenas" className="hover:text-blue-300">
                Radios
              </Link>
              <Link to="/routerswitch" className="hover:text-blue-300">
                Router/Switch
              </Link>
              <Link to="/camarasip" className="hover:text-blue-300">
                Cámaras
              </Link>
              <Link to="/dashboard" className="hover:text-blue-300">
                Dashboard
              </Link>
            </div>
          )}

          {/* Usuario y botón salir (desktop) */}
          {user && (
            <div className="hidden md:flex items-center gap-3 ml-auto">
              <span className="font-medium">👤 {user.nombre}</span>
              <button
                onClick={logout}
                className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm"
              >
                Salir
              </button>
            </div>
          )}

          {/* Botón hamburguesa en móvil */}
          {user && (
            <button
              className="md:hidden text-white text-2xl"
              onClick={() => setOpen(!open)}
            >
              ☰
            </button>
          )}
        </div>

        {/* Menú desplegable móvil */}
        {open && user && (
          <div className="flex flex-col gap-3 mt-3 md:hidden bg-gray-700 p-4 rounded-lg">
            <Link to="/clientes" onClick={() => setOpen(false)}>
              Clientes
            </Link>
            <Link to="/sucursales" onClick={() => setOpen(false)}>
              Sucursales
            </Link>
            <Link to="/servicios" onClick={() => setOpen(false)}>
              Servicios
            </Link>
            <Link to="/radios_antenas" onClick={() => setOpen(false)}>
              Radios
            </Link>
            <Link to="/routerswitch" onClick={() => setOpen(false)}>
              Router/Switch
            </Link>
            <Link to="/camarasip" onClick={() => setOpen(false)}>
              Cámaras
            </Link>
            <Link to="/dashboard" onClick={() => setOpen(false)}>
              Dashboard
            </Link>

            {/* Usuario y salir en móvil */}
            <div className="border-t border-gray-600 pt-3 mt-3">
              <span className="block mb-2">👤 {user.nombre}</span>
              <button
                onClick={logout}
                className="w-full px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm"
              >
                Salir
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 📌 Rutas */}
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login onLogin={setUser} />} />

        {/* Rutas privadas */}
        <Route
          path="/clientes"
          element={
            <PrivateRoute>
              <Clientes />
            </PrivateRoute>
          }
        />
        <Route
          path="/sucursales"
          element={
            <PrivateRoute>
              <Sucursales />
            </PrivateRoute>
          }
        />
        <Route
          path="/servicios"
          element={
            <PrivateRoute>
              <Servicios />
            </PrivateRoute>
          }
        />
        <Route
          path="/radios_antenas"
          element={
            <PrivateRoute>
              <RadiosAntenas />
            </PrivateRoute>
          }
        />
        <Route
          path="/routerswitch"
          element={
            <PrivateRoute>
              <RouterSwitch />
            </PrivateRoute>
          }
        />
        <Route
          path="/camarasip"
          element={
            <PrivateRoute>
              <CamarasIP />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard user={user} onLogout={logout} />
            </PrivateRoute>
          }
        />

        {/* Redirección según login */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}
