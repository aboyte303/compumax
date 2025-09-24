// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // Si no hay token, redirige al login
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;
