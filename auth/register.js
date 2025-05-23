// auth/register.js
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Se requieren username y password' });

  try {
    const connection = await pool.getConnection();
    const [existing] = await connection.query('SELECT * FROM usuario WHERE username = ?', [username]);
    if (existing.length) {
      connection.release();
      return res.status(409).json({ error: 'El usuario ya existe' });
    }
    const hash = await bcrypt.hash(password, 10);
    await connection.query(
      'INSERT INTO usuario (username, password, rol, estado) VALUES (?, ?, "cliente", 1)',
      [username, hash]
    );
    connection.release();
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
