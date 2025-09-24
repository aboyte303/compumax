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
import Dashboard from "./pages/dashboard"; // ojo: la mayúscula importa

// 🔒 Ruta privada (solo accesible si hay token)
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login"; // fuerza recarga
  };

  return (
    <Router>
      {/* 🔗 Barra de navegación */}
      <nav style={{ display: "flex", gap: 12, padding: 10 }}>
        {user ? (
          <>
            <Link to="/clientes">Clientes</Link>
            <Link to="/sucursales">Sucursales</Link>
            <Link to="/servicios">Servicios</Link>
            <Link to="/radios_antenas">Radios</Link>
            <Link to="/routerswitch">Router/Switch</Link>
            <Link to="/camarasip">Cámaras</Link>
            <Link to="/dashboard">Dashboard</Link>
            <span style={{ marginLeft: "auto" }}>👤 {user.nombre}</span>
            <button onClick={logout}>Salir</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
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
