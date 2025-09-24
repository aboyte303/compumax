const sql = require('mssql');
const config = require('../config/dbconfig');
const express = require("express");

const router = express.Router();

// Obtener todas las cámaras
router.get('/', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query(`
             SELECT 
                 c.id, 
                 c.id_sucursal, 
                 c.nombre, 
                 c.modelo, 
                 c.mac, 
                 c.sn, 
                 c.usuario, 
                 c.contrasena, 
                 c.ubicacion, 
                 c.zona, 
                 c.ip_cliente,
                 s.nombre AS nombre_sucursal,
                 cli.nombre AS nombre_cliente,
                 u1.nombre AS creado_por_nombre,
                 u2.nombre AS actualizado_por_nombre,
                 c.fecha_creacion,
                 c.fecha_actualizacion
             FROM camaras_ip c
             INNER JOIN sucursales s ON c.id_sucursal = s.id
             INNER JOIN clientes cli ON s.id_cliente = cli.id
             LEFT JOIN usuarios u1 ON c.creado_por = u1.id
             LEFT JOIN usuarios u2 ON c.actualizado_por = u2.id
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener cámaras:', err);
        res.status(500).send('Error al obtener cámaras');
    }
});

// Obtener una cámara por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT 
                    c.id, 
                    c.id_sucursal, 
                    c.nombre, 
                    c.modelo, 
                    c.mac, 
                    c.sn, 
                    c.usuario, 
                    c.contrasena, 
                    c.ubicacion, 
                    c.zona, 
                    c.ip_cliente,
                    s.nombre AS nombre_sucursal,
                    cli.nombre AS nombre_cliente,
                    u1.nombre AS creado_por_nombre,
                    u2.nombre AS actualizado_por_nombre,
                    c.fecha_creacion,
                    c.fecha_actualizacion
                FROM camaras_ip c
                INNER JOIN sucursales s ON c.id_sucursal = s.id
                INNER JOIN clientes cli ON s.id_cliente = cli.id
                LEFT JOIN usuarios u1 ON c.creado_por = u1.id
                LEFT JOIN usuarios u2 ON c.actualizado_por = u2.id
                WHERE c.id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).send('Cámara no encontrada');
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error al obtener cámara:', err);
        res.status(500).send('Error al obtener cámara');
    }
});

// Crear nueva cámara
router.post('/', async (req, res) => {
    const { id_sucursal, nombre, modelo, mac, sn, usuario, contrasena, ubicacion, zona, ip_cliente } = req.body;
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('id_sucursal', sql.Int, id_sucursal)
            .input('nombre', sql.VarChar, nombre)
            .input('modelo', sql.VarChar, modelo)
            .input('mac', sql.VarChar, mac)
            .input('sn', sql.VarChar, sn)
            .input('usuario', sql.VarChar, usuario)
            .input('contrasena', sql.VarChar, contrasena)
            .input('ubicacion', sql.VarChar, ubicacion)
            .input('zona', sql.VarChar, zona)
            .input('ip_cliente', sql.VarChar, ip_cliente)
            .input('creado_por', sql.Int, req.user?.id || null) // Guardamos ID del usuario
            .query(`
                INSERT INTO camaras_ip (
                    id_sucursal, nombre, modelo, mac, sn, usuario, contrasena,
                    ubicacion, zona, ip_cliente, creado_por, fecha_creacion
                )
                VALUES (
                    @id_sucursal, @nombre, @modelo, @mac, @sn, @usuario, @contrasena,
                    @ubicacion, @zona, @ip_cliente, @creado_por, GETDATE()
                )
            `);
        res.send('Cámara creada correctamente');
    } catch (err) {
        console.error('Error al crear cámara:', err);
        res.status(500).send('Error al crear cámara');
    }
});

// Actualizar cámara
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { id_sucursal, nombre, modelo, mac, sn, usuario, contrasena, ubicacion, zona, ip_cliente } = req.body;
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('id', sql.Int, id)
            .input('id_sucursal', sql.Int, id_sucursal)
            .input('nombre', sql.VarChar, nombre)
            .input('modelo', sql.VarChar, modelo)
            .input('mac', sql.VarChar, mac)
            .input('sn', sql.VarChar, sn)
            .input('usuario', sql.VarChar, usuario)
            .input('contrasena', sql.VarChar, contrasena)
            .input('ubicacion', sql.VarChar, ubicacion)
            .input('zona', sql.VarChar, zona)
            .input('ip_cliente', sql.VarChar, ip_cliente)
            .input('actualizado_por', sql.Int, req.user?.id || null)
            .query(`
                     UPDATE camaras_ip
                     SET id_sucursal = @id_sucursal,
                         nombre = @nombre,
                         modelo = @modelo,
                         mac = @mac,
                         sn = @sn,
                         usuario = @usuario,
                         contrasena = @contrasena,
                         ubicacion = @ubicacion,
                         zona = @zona,
                         ip_cliente = @ip_cliente,
                         actualizado_por = @actualizado_por,
                         fecha_actualizacion = GETDATE()
                     WHERE id = @id
            `);
        res.send('Cámara actualizada correctamente');
    } catch (err) {
        console.error('Error al actualizar cámara:', err);
        res.status(500).send('Error al actualizar cámara');
    }
});

// Eliminar cámara
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM camaras_ip WHERE id = @id');
        res.send('Cámara eliminada correctamente');
    } catch (err) {
        console.error('Error al eliminar cámara:', err);
        res.status(500).send('Error al eliminar cámara');
    }
});

module.exports = router;
