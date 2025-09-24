const express = require('express');
const sql = require('mssql');
const config = require('../config/dbconfig');

const router = express.Router();

// Obtener todos los servicios
router.get('/', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query(`
      SELECT 
        s.id,
        s.id_sucursal,
        c.nombre AS nombre_cliente,
        su.nombre AS nombre_sucursal,
        s.nombre,
        s.descripcion,
        s.fecha,
        u1.nombre AS creado_por_nombre,
        u2.nombre AS actualizado_por_nombre
      FROM servicios s
      INNER JOIN sucursales su ON s.id_sucursal = su.id
      INNER JOIN clientes c ON su.id_cliente = c.id
      LEFT JOIN usuarios u1 ON s.creado_por = u1.id
      LEFT JOIN usuarios u2 ON s.actualizado_por = u2.id
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener servicios:', err);
    res.status(500).send('Error al obtener servicios');
  }
});

// Obtener servicio por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM servicios WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).send('Servicio no encontrado');
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error al obtener servicio:', err);
    res.status(500).send('Error al obtener servicio');
  }
});

// Crear nuevo servicio
router.post('/', async (req, res) => {
  const { id_sucursal, nombre, descripcion, fecha } = req.body;
  try {
    let pool = await sql.connect(config);
    await pool.request()
      .input('id_sucursal', sql.Int, id_sucursal)
      .input('nombre', sql.VarChar, nombre)
      .input('descripcion', sql.Text, descripcion || null)
      .input('fecha', sql.Date, fecha || null)
      .input('creado_por', sql.Int, req.user?.id || null)
      .query(`
        INSERT INTO servicios (id_sucursal, nombre, descripcion, fecha, creado_por)
        VALUES (@id_sucursal, @nombre, @descripcion, @fecha, @creado_por)
      `);
    res.send('Servicio creado correctamente');
  } catch (err) {
    console.error('Error al crear servicio:', err);
    res.status(500).send('Error al crear servicio');
  }
});

// Actualizar servicio por ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { id_sucursal, nombre, descripcion, fecha } = req.body;
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('id', sql.Int, id)
      .input('id_sucursal', sql.Int, id_sucursal)
      .input('nombre', sql.VarChar, nombre)
      .input('descripcion', sql.Text, descripcion || null)
      .input('fecha', sql.Date, fecha || null)
      .input('actualizado_por', sql.Int, req.user?.id || null)
      .query(`
        UPDATE servicios
        SET id_sucursal = @id_sucursal,
            nombre = @nombre,
            descripcion = @descripcion,
            fecha = @fecha,
            actualizado_por = @actualizado_por
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send('Servicio no encontrado');
    }

    res.send('Servicio actualizado correctamente');
  } catch (err) {
    console.error('Error al actualizar servicio:', err);
    res.status(500).send('Error al actualizar servicio');
  }
});

// Eliminar servicio por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM servicios WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send('Servicio no encontrado');
    }

    res.send('Servicio eliminado correctamente');
  } catch (err) {
    console.error('Error al eliminar servicio:', err);
    res.status(500).send('Error al eliminar servicio');
  }
});

module.exports = router;
