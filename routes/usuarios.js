const express = require('express');
const pool = require('../db'); // Asegúrate de que la ruta a tu pool de MySQL es correcta

const router = express.Router(); // Definimos el router aquí

// Obtener usuario por ID (para mostrar username antes de eliminar)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT id_usuarios, username FROM usuario WHERE id_usuarios = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Dar de baja usuario (admin)
router.put('/:id/disable', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      'UPDATE usuario SET estado = 0 WHERE id_usuarios = ?',
      [id]
    );
    res.json({ message: 'Usuario deshabilitado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al deshabilitar usuario' });
  }
});

module.exports = router;
