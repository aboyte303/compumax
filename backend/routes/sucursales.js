const express = require('express');
const sql = require('mssql');
const config = require('../config/dbconfig');

const router = express.Router();

// Obtener todas las sucursales sin id por que sin id esta mas rico
// Obtener todas las sucursales con el nombre del cliente
router.get('/', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .query(`
        SELECT 
  s.id,
  s.id_cliente,
  c.nombre AS nombre_cliente,
  s.nombre
FROM sucursales s
INNER JOIN clientes c ON s.id_cliente = c.id
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener sucursales:', err);
    res.status(500).send('Error al obtener sucursales');
  }
});


// Obtener una sucursal con id por que sin id es delito
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM sucursales WHERE id = @id');
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error al obtener sucursal:', err);
    res.status(500).send('Error al obtener sucursal');
  }
});

// Crear sucursal
router.post('/', async (req, res) => {
  const { id_cliente, nombre } = req.body;
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('id_cliente', sql.Int, id_cliente)
      .input('nombre', sql.VarChar, nombre)
      .query('INSERT INTO sucursales (id_cliente, nombre) VALUES (@id_cliente, @nombre)');
    res.send('Sucursal creada correctamente');
  } catch (err) {
    console.error('Error al crear sucursal:', err);
    res.status(500).send('Error al crear sucursal');
  }
});

// Actualizar sucursal
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { id_cliente, nombre } = req.body;
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .input('id_cliente', sql.Int, id_cliente)
      .input('nombre', sql.VarChar, nombre)
      .query('UPDATE sucursales SET id_cliente = @id_cliente, nombre = @nombre WHERE id = @id');
    res.send('Sucursal actualizada correctamente');
  } catch (err) {
    console.error('Error al actualizar sucursal:', err);
    res.status(500).send('Error al actualizar sucursal');
  }
});

// Eliminar sucursal
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM sucursales WHERE id = @id');
    res.send('Sucursal eliminada correctamente');
  } catch (err) {
    console.error('Error al eliminar sucursal:', err);
    res.status(500).send('Error al eliminar sucursal');
  }
});

module.exports = router;
