const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/dbconfig');

const router = express.Router();

// Helper: genera JWT
function signToken(user) {
  return jwt.sign(
    { id: user.id, nombre: user.nombre, usuario: user.usuario, rol: user.rol },
    process.env.JWT_SECRET || "secreto",  
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { nombre, usuario, contrasena, rol = 'usuario' } = req.body;
  if (!nombre || !usuario || !contrasena) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  try {
    const pool = await sql.connect(config);

    // Verificar si usuario existe
    const existe = await pool.request()
      .input('usuario', sql.VarChar, usuario)
      .query('SELECT id FROM usuarios WHERE usuario = @usuario');

    if (existe.recordset.length > 0) {
      return res.status(409).json({ error: 'Usuario ya registrado' });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    await pool.request()
      .input('nombre', sql.VarChar, nombre)
      .input('usuario', sql.VarChar, usuario)
      .input('contrasena_hash', sql.VarChar, hash)
      .input('rol', sql.VarChar, rol)
      .query(`
        INSERT INTO usuarios (nombre, usuario, contrasena_hash, rol, activo, fecha_creacion)
        VALUES (@nombre, @usuario, @contrasena_hash, @rol, 1, GETDATE())
      `);

    res.json({ message: 'Usuario registrado' });
  } catch (err) {
    console.error('Error en register:', err);
    res.status(500).json({ error: 'Error en registro' });
  }
});



// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { usuario, contrasena } = req.body;
  console.log(" Datos recibidos en login:", { usuario, contrasena });

  if (!usuario || !contrasena) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('usuario', sql.VarChar, usuario) 
      .query(`
        SELECT id, nombre, usuario, contrasena_hash, rol, activo
        FROM usuarios
        WHERE usuario = @usuario
      `);

    console.log(" Resultado de SQL:", result.recordset);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña inválidos' });
    }

    const user = result.recordset[0];
    if (!user.activo) {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    const ok = await bcrypt.compare(contrasena, user.contrasena_hash);
    console.log(" Resultado bcrypt.compare:", ok);

    if (!ok) {
      return res.status(401).json({ error: 'Usuario o contraseña inválidos' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, nombre: user.nombre, usuario: user.usuario, rol: user.rol }
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en login' }); 
  }
});


module.exports = router;
