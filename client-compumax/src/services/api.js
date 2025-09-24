import axios from "axios";

// Usa la variable de entorno o un fallback
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000/api",
});

// 🔑 Middleware para enviar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default api;
