const express = require('express');
const sql = require('mssql');
const config = require('../config/dbconfig');

const router = express.Router();

//Obtener todos los radios/antenas
router.get('/', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query(`
      SELECT 
        r.id,
        r.id_sucursal,
        s.id_cliente,
        r.nombre,
        r.modelo,
        r.mac,
        r.sn,
        r.usuario,
        r.contrasena,
        r.tipo,
        r.ssid,
        r.ssid_psw,
        r.ip_cliente,
        s.nombre AS nombre_sucursal,
        cli.nombre AS nombre_cliente,
        u1.nombre AS creado_por_nombre,
        u2.nombre AS actualizado_por_nombre,
        r.fecha_creacion,
        r.fecha_actualizacion
      FROM radios_antenas r
      INNER JOIN sucursales s ON r.id_sucursal = s.id
      INNER JOIN clientes cli ON s.id_cliente = cli.id
      LEFT JOIN usuarios u1 ON r.creado_por = u1.id
      LEFT JOIN usuarios u2 ON r.actualizado_por = u2.id
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener radios/antenas:', err);
    res.status(500).send('Error al obtener radios/antenas');
  }
});


//Obtener radio/antena por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM radios_antenas WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).send('Radio/antena no encontrado');
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error al obtener radio/antena:', err);
    res.status(500).send('Error al obtener radio/antena');
  }
});

//Crear nuevo radio/antena
router.post('/', async (req, res) => {
  const {
    id_sucursal, nombre, marca, modelo, mac, sn, usuario, contrasena,
    tipo, ssid, ssid_psw, ip_cliente
  } = req.body;
  
  try {
    let pool = await sql.connect(config);
    await pool.request()
      .input('id_sucursal', sql.Int, id_sucursal)
      .input('nombre', sql.VarChar, nombre || null)
      .input('marca', sql.VarChar, marca || null)
      .input('modelo', sql.VarChar, modelo || null)
      .input('mac', sql.VarChar, mac || null)
      .input('sn', sql.VarChar, sn || null)
      .input('usuario', sql.VarChar, usuario || null)
      .input('contrasena', sql.VarChar, contrasena || null)
      .input('tipo', sql.VarChar, tipo || null)
      .input('ssid', sql.VarChar, ssid || null)
      .input('ssid_psw', sql.VarChar, ssid_psw || null)
      .input('ip_cliente', sql.VarChar, ip_cliente || null)
      .input('creado_por', sql.Int, req.user?.id || null)
      .query(`
        INSERT INTO radios_antenas
        (id_sucursal, nombre, marca, modelo, mac, sn, usuario, contrasena, tipo, ssid, ssid_psw, ip_cliente, creado_por , fecha_creacion)
        VALUES
        (@id_sucursal, @nombre, @marca, @modelo, @mac, @sn, @usuario, @contrasena, @tipo, @ssid, @ssid_psw, @ip_cliente , @creado_por, GETDATE())
      `);

    res.send('Radio/antena creado correctamente');
  } catch (err) {
    console.error('Error al crear radio/antena:', err);
    res.status(500).send('Error al crear radio/antena');
  }
});

//Actualizar radio/antena por ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    id_sucursal, nombre, marca, modelo, mac, sn, usuario, contrasena,
    tipo, ssid, ssid_psw, ip_cliente
  } = req.body;
  
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('id', sql.Int, id)
      .input('id_sucursal', sql.Int, id_sucursal)
      .input('nombre', sql.VarChar, nombre || null)
      .input('marca', sql.VarChar, marca || null)
      .input('modelo', sql.VarChar, modelo || null)
      .input('mac', sql.VarChar, mac || null)
      .input('sn', sql.VarChar, sn || null)
      .input('usuario', sql.VarChar, usuario || null)
      .input('contrasena', sql.VarChar, contrasena || null)
      .input('tipo', sql.VarChar, tipo || null)
      .input('ssid', sql.VarChar, ssid || null)
      .input('ssid_psw', sql.VarChar, ssid_psw || null)
      .input('ip_cliente', sql.VarChar, ip_cliente || null)
      .input('actualizado_por', sql.Int, req.user?.id || null)
      .query(`
        UPDATE radios_antenas
        SET id_sucursal = @id_sucursal,
            nombre = @nombre,
            marca = @marca,
            modelo = @modelo,
            mac = @mac,
            sn = @sn,
            usuario = @usuario,
            contrasena = @contrasena,
            tipo = @tipo,
            ssid = @ssid,
            ssid_psw = @ssid_psw,
            ip_cliente = @ip_cliente,
            actualizado_por = @actualizado_por,
            fecha_actualizacion = GETDATE()
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send('Radio/antena no encontrado');
    }

    res.send('Radio/antena actualizado correctamente');
  } catch (err) {
    console.error('Error al actualizar radio/antena:', err);
    res.status(500).send('Error al actualizar radio/antena');
  }
});

//Eliminar radio/antena por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM radios_antenas WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send('Radio/antena no encontrado');
    }

    res.send('Radio/antena eliminado correctamente');
  } catch (err) {
    console.error('Error al eliminar radio/antena:', err);
    res.status(500).send('Error al eliminar radio/antena');
  }
});

module.exports = router;
