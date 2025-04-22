const express = require('express');
const routerUsers = express.Router();
const poolUsers = require('../db');

// Dar de baja usuario (admin)
routerUsers.put('/:id/disable', async (req, res) => {
  const { id } = req.params;
  try {
    await poolUsers.query(
      'UPDATE usuario SET estado=0 WHERE id_usuarios=?',
      [id]
    );
    res.json({ message: 'Usuario deshabilitado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al deshabilitar usuario' });
  }
});

module.exports = routerUsers;