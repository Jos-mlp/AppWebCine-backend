const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authorizeRole } = require('../middleware/auth');

// Crear función de película (admin)
router.post('/', authorizeRole('admin'), async (req, res) => {
  const { pelicula_nombre, pelicula_descripcion, poster_pelicula, fecha, id_sala } = req.body;
  if (!pelicula_nombre || !pelicula_descripcion || !fecha || !id_sala) {
    return res.status(400).json({ error: 'Faltan datos de la función' });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO funcion_pelicula
       (pelicula_nombre,pelicula_descripcion,poster_pelicula,fecha,id_sala)
       VALUES (?,?,?,?,?)`,
      [pelicula_nombre, pelicula_descripcion, poster_pelicula, fecha, id_sala]
    );
    res.status(201).json({ id_funcion_pelicula: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear función' });
  }
});

// Modificar datos de función (admin)
router.put('/:id', authorizeRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { pelicula_nombre, pelicula_descripcion, poster_pelicula } = req.body;
  try {
    await pool.query(
      `UPDATE funcion_pelicula SET pelicula_nombre=?, pelicula_descripcion=?, poster_pelicula=?
       WHERE id_funcion_pelicula=?`,
      [pelicula_nombre, pelicula_descripcion, poster_pelicula, id]
    );
    res.json({ message: 'Función actualizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar función' });
  }
});

// Listar funciones
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM funcion_pelicula');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener funciones' });
  }
});

module.exports = router;