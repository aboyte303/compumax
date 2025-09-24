const express = require('express');
const sql = require('mssql');
const config = require('../config/dbconfig');

const router = express.Router();

/**
obtener datos
 */
router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const query = `
      -- RADIOS / ANTENAS
      SELECT 
        r.id,
        'RADIO/ANTENA' AS tipo,
        r.nombre,
        r.modelo,
        r.mac,
        r.ip_cliente,
        s.nombre AS nombre_sucursal,
        c.nombre AS nombre_cliente
      FROM radios_antenas r
      INNER JOIN sucursales s ON s.id = r.id_sucursal
      INNER JOIN clientes  c ON c.id = s.id_cliente

      UNION ALL

      -- ROUTER / SWITCH (no tiene ip_cliente, lo normalizamos a NULL)
      SELECT 
        rs.id,
        'ROUTER/SWITCH' AS tipo,
        rs.nombre,
        rs.modelo,
        rs.mac,
        CAST(NULL AS VARCHAR(100)) AS ip_cliente,
        s.nombre AS nombre_sucursal,
        c.nombre AS nombre_cliente
      FROM router_switch rs
      INNER JOIN sucursales s ON s.id = rs.id_sucursal
      INNER JOIN clientes  c ON c.id = s.id_cliente

      UNION ALL

      -- CAMARAS IP
      SELECT 
        cam.id,
        'CAMARA IP' AS tipo,
        cam.nombre,
        cam.modelo,
        cam.mac,
        cam.ip_cliente,
        s.nombre AS nombre_sucursal,
        c.nombre AS nombre_cliente
      FROM camaras_ip cam
      INNER JOIN sucursales s ON s.id = cam.id_sucursal
      INNER JOIN clientes  c ON c.id = s.id_cliente

      ORDER BY nombre_cliente, nombre_sucursal, tipo, nombre;
    `;

    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en Dashboard:', err);
    res.status(500).send('Error al obtener datos del dashboard');
  }
});

module.exports = router;
