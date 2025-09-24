const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sql = require("mssql");
const config = require("../config/dbconfig");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro"; 

// 📌 LOGIN
router.post("/", async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input("usuario", sql.VarChar, usuario)
      .query(`
        SELECT id, nombre, usuario, contrasena_hash, rol, activo
        FROM usuarios
        WHERE usuario = @usuario
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const user = result.recordset[0];

    // ⚠️ Validar si está activo
    if (!user.activo) {
      return res.status(403).json({ message: "Usuario inactivo" });
    }

    // Comparar contraseña
    const validPassword = await bcrypt.compare(contrasena, user.contrasena_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Generar JWT con más datos del usuario
    const token = jwt.sign(
      {
        id: user.id,
        usuario: user.usuario,
        nombre: user.nombre,
        rol: user.rol
      },
      JWT_SECRET,
      { expiresIn: "8h" } // ⏰ dura 8 horas
    );

    // Retornar token + datos de usuario
    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        usuario: user.usuario,
        nombre: user.nombre,
        rol: user.rol
      }
    });

  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
