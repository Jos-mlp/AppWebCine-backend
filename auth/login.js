// auth/login.js
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'clave-super-secreta';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Se requieren username y password' });
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM usuario WHERE username = ? LIMIT 1', [username]);
    connection.release();
    if (rows.length === 0) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

    const user = rows[0];
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: user.id_usuarios, username: user.username, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
