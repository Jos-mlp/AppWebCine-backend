const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authorizeRole } = require('../middleware/auth');

// Crear sala (admin)
router.post('/', authorizeRole('admin'), async (req, res) => {
  const { numero_sala, filas, columnas } = req.body;
  if (!numero_sala || filas == null || columnas == null) {
    return res.status(400).json({ error: 'Faltan datos de sala' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO sala (numero_sala, filas, columnas) VALUES (?, ?, ?)',
      [numero_sala, filas, columnas]
    );
    res.status(201).json({ id_sala: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear sala' });
  }
});

// Listar todas las salas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sala');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener salas' });
  }
});

// Modificar capacidad de sala (admin)
router.put('/:id', authorizeRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { filas, columnas } = req.body;
  if (filas == null || columnas == null) {
    return res.status(400).json({ error: 'Faltan filas o columnas' });
  }
  try {
    // Verificar si hay reservas activas para esa sala
    const [reserved] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM estado_asiento ea
       JOIN asiento a ON ea.id_asiento = a.id_asiento
       WHERE a.id_sala = ? AND ea.estado IN ('Reservado','Ocupado')`,
      [id]
    );
    if (reserved[0].cnt > 0) {
      return res.status(400).json({ error: 'La sala tiene asientos reservados, no se puede cambiar capacidad' });
    }
    await pool.query(
      'UPDATE sala SET filas = ?, columnas = ? WHERE id_sala = ?',
      [filas, columnas, id]
    );
    res.json({ message: 'Capacidad actualizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar capacidad' });
  }
});

module.exports = router;