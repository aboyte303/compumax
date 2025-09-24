import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";  // 👈 importa el cliente axios

function Login({ onLogin }) {   // 👈 recibe la prop
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("🚀 Enviando credenciales:", { usuario, contrasena });

    try {
      // 👇 usamos api.post en lugar de fetch
      const response = await api.post("/auth/login", { usuario, contrasena });

      console.log("✅ Respuesta del backend:", response.data);

      // Guardamos token y user en localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Actualizamos el estado global en App
      if (onLogin) onLogin(response.data.user);

      // Redirigir a dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Error en login:", err);
      setError("Error en el inicio de sesión");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Login;
