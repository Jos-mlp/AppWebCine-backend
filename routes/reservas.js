const express = require('express');
const router = express.Router();
const pool = require('../db');
const QRCode = require('qrcode');

// Obtener estado de asientos para una función en una fecha
router.get('/funcion/:funcionId/asientos', async (req, res) => {
  const { funcionId } = req.params;
  const { fecha } = req.query;
  if (!fecha) {
    return res.status(400).json({ error: 'Falta la fecha en query' });
  }
  try {
    // Obtener sala de la función
    const [[funcion]] = await pool.query(
      'SELECT id_sala FROM funcion_pelicula WHERE id_funcion_pelicula=?',
      [funcionId]
    );
    if (!funcion) return res.status(404).json({ error: 'Función no existe' });

    // Obtener todos los asientos de la sala
    const [asientos] = await pool.query(
      'SELECT id_asiento, fila, columna FROM asiento WHERE id_sala=?',
      [funcion.id_sala]
    );
    // Obtener estados para la fecha
    const [estados] = await pool.query(
      'SELECT id_asiento, estado FROM estado_asiento WHERE fecha=?',
      [fecha]
    );
    const mapEstado = {};
    estados.forEach(e => { mapEstado[e.id_asiento] = e.estado; });

    // Construir respuesta
    const result = asientos.map(a => ({
      id_asiento: a.id_asiento,
      fila: a.fila,
      columna: a.columna,
      estado: mapEstado[a.id_asiento] || 'Disponible'
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener asientos' });
  }
});

// Crear reserva
router.post('/', async (req, res) => {
  const { id_funcion_pelicula, fecha, asientos } = req.body;
  const userId = req.user.id;
  if (!id_funcion_pelicula || !fecha || !Array.isArray(asientos) || asientos.length === 0) {
    return res.status(400).json({ error: 'Datos incompletos para reserva' });
  }
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insertar reservación
    const [r] = await connection.query(
      'INSERT INTO reserva (codigoqr,estado,id_usuarios,id_funcion_pelicula) VALUES ("", "confirmada", ?, ?)',
      [userId, id_funcion_pelicula]
    );
    const reservaId = r.insertId;

    // Insertar estado_asiento para cada asiento
    for (const asientoId of asientos) {
      // Verificar disponibilidad
      const [[exists]] = await connection.query(
        'SELECT COUNT(*) AS cnt FROM estado_asiento WHERE id_asiento=? AND fecha=? AND estado!="Disponible"',
        [asientoId, fecha]
      );
      if (exists.cnt > 0) {
        throw new Error(`Asiento ${asientoId} no disponible`);
      }
      await connection.query(
        'INSERT INTO estado_asiento (fecha,estado,id_asiento,id_reserva) VALUES (?,?,?,?)',
        [fecha, 'Reservado', asientoId, reservaId]
      );
    }

    // Generar código QR
    const qrData = { reservaId, id_funcion_pelicula, fecha, asientos };
    const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));
    await connection.query(
      'UPDATE reserva SET codigoqr=? WHERE id_reserva=?',
      [qrCodeUrl, reservaId]
    );

    await connection.commit();
    connection.release();

    res.status(201).json({ reservaId, qrCodeUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Error al crear reserva' });
  }
});

// Listar reservas del usuario
router.get('/', async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM reserva WHERE id_usuarios=?',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

module.exports = router;