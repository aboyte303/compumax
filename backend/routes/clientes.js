const express = require('express');
const sql = require('mssql');
const config = require('../config/dbconfig');

const router = express.Router();

// obtener clientes sin id por que sin id esta mas rico
router.get('/', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query('SELECT * FROM clientes');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener clientes:', err);
    res.status(500).send('Error al obtener clientes');
  }
});

//  obtener clientes con id por que sin id es delito
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM clientes WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).send('Cliente no encontrado');
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error al obtener cliente:', err);
    res.status(500).send('Error al obtener cliente');
  }
});


// crear cliente
router.post('/', async (req, res) => {
  const { nombre } = req.body;
  try {
    let pool = await sql.connect(config);
    await pool.request()
      .input('nombre', sql.VarChar, nombre)
      .query('INSERT INTO clientes (nombre) VALUES (@nombre)');
    res.send('Cliente creado correctamente');
  } catch (err) {
    console.error('Error al crear cliente:', err);
    res.status(500).send('Error al crear cliente');
  }
});

// actualizar cliente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    let pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.VarChar, nombre)
      .query('UPDATE clientes SET nombre = @nombre WHERE id = @id');
    res.send('Cliente actualizado correctamente');
  } catch (err) {
    console.error('Error al actualizar cliente:', err);
    res.status(500).send('Error al actualizar cliente');
  }
});

// e liminar cliente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM clientes WHERE id = @id');
    res.send('Cliente eliminado correctamente');
  } catch (err) {
    console.error('Error al eliminar cliente:', err);
    res.status(500).send('Error al eliminar cliente');
  }
});

module.exports = router;
