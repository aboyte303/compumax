const express = require('express');
const sql = require('mssql');
const config = require('../config/dbconfig');

const router = express.Router();

// Obtener todos los router/switch
router.get('/', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query(`
      SELECT 
        rs.id,
        rs.id_sucursal,
        su.id_cliente,
        su.nombre AS nombre_sucursal,
        c.nombre AS nombre_cliente,
        rs.nombre,
        rs.marca,
        rs.modelo,
        rs.mac,
        rs.sn,
        rs.usuario,
        rs.contrasena,
        u1.nombre AS creado_por_nombre,
        u2.nombre AS actualizado_por_nombre
      FROM router_switch rs
      INNER JOIN sucursales su ON rs.id_sucursal = su.id
      INNER JOIN clientes c ON su.id_cliente = c.id
      LEFT JOIN usuarios u1 ON rs.creado_por = u1.id
      LEFT JOIN usuarios u2 ON rs.actualizado_por = u2.id
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener router/switch:', err);
    res.status(500).send('Error al obtener router/switch');
  }
});

// Obtener un router/switch por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM router_switch WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).send('Router/switch no encontrado');
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error al obtener router/switch:', err);
    res.status(500).send('Error al obtener router/switch');
  }
});

// Crear un nuevo router/switch
router.post('/', async (req, res) => {
  const { id_sucursal, nombre, marca, modelo, mac, sn, usuario, contrasena } = req.body;
  try {
    let pool = await sql.connect(config);
    await pool.request()
      .input('id_sucursal', sql.Int, id_sucursal)
      .input('nombre', sql.VarChar, nombre)
      .input('marca', sql.VarChar, marca)
      .input('modelo', sql.VarChar, modelo)
      .input('mac', sql.VarChar, mac)
      .input('sn', sql.VarChar, sn)
      .input('usuario', sql.VarChar, usuario)
      .input('contrasena', sql.VarChar, contrasena)
      .input('creado_por', sql.Int, req.user?.id || null)
      .query(`
        INSERT INTO router_switch (id_sucursal, nombre, marca, modelo, mac, sn, usuario, contrasena, creado_por, fecha_creacion)
        VALUES (@id_sucursal, @nombre, @marca, @modelo, @mac, @sn, @usuario, @contrasena, @creado_por, GETDATE())
      `);

    res.send('Router/switch creado correctamente');
  } catch (err) {
    console.error('Error al crear router/switch:', err);
    res.status(500).send('Error al crear router/switch');
  }
});

// Actualizar un router/switch
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { id_sucursal, nombre, marca, modelo, mac, sn, usuario, contrasena } = req.body;
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('id', sql.Int, id)
      .input('id_sucursal', sql.Int, id_sucursal)
      .input('nombre', sql.VarChar, nombre)
      .input('marca', sql.VarChar, marca)
      .input('modelo', sql.VarChar, modelo)
      .input('mac', sql.VarChar, mac)
      .input('sn', sql.VarChar, sn)
      .input('usuario', sql.VarChar, usuario)
      .input('contrasena', sql.VarChar, contrasena)
      .input('actualizado_por', sql.Int, req.user?.id || null)
      .query(`
        UPDATE router_switch
        SET id_sucursal = @id_sucursal,
            nombre = @nombre,
            marca = @marca,
            modelo = @modelo,
            mac = @mac,
            sn = @sn,
            usuario = @usuario,
            contrasena = @contrasena,
            actualizado_por = @actualizado_por,
            fecha_actualizacion = GETDATE()
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send('Router/switch no encontrado');
    }

    res.send('Router/switch actualizado correctamente');
  } catch (err) {
    console.error('Error al actualizar router/switch:', err);
    res.status(500).send('Error al actualizar router/switch');
  }
});

// Eliminar un router/switch
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM router_switch WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send('Router/switch no encontrado');
    }

    res.send('Router/switch eliminado correctamente');
  } catch (err) {
    console.error('Error al eliminar router/switch:', err);
    res.status(500).send('Error al eliminar router/switch');
  }
});

module.exports = router;
