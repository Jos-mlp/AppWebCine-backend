// app.js
const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'cine'
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
  }
  console.log('Conexión a la base de datos establecida');
});

// Clave para firmar el JWT
const JWT_SECRET = 'm12345';

// ======================================================
// Endpoint para registrar un nuevo usuario
// ======================================================
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  
  // Validar que se envíen username y password
  if (!username || !password) {
    return res.status(400).json({ error: 'Se requieren username y password' });
  }

  // Inserta el nuevo usuario en la tabla "usuario"
  const sql = 'INSERT INTO usuario (username, password, rol, estado) VALUES (?, ?, "cliente", 1)';
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error('Error al registrar el usuario:', err);
      return res.status(500).json({ error: 'Error en el servidor al registrar el usuario' });
    }
    return res.status(201).json({ message: 'Usuario registrado correctamente' });
  });
});

// ======================================================
// Endpoint para login (autenticación) y generación de JWT
// ======================================================
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Validar que se envíen username y password
  if (!username || !password) {
    return res.status(400).json({ error: 'Se requieren username y password' });
  }

  // Consulta a la tabla "usuario" para verificar las credenciales
  const sql = 'SELECT * FROM usuario WHERE username = ? AND password = ? LIMIT 1';
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    // Si no se encuentra el usuario, se retorna 401 (no autorizado)
    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const user = results[0];

    // Se genera el token JWT incluyendo en el payload algunos datos del usuario
    const token = jwt.sign(
      {
        id: user.id_usuarios,
        username: user.username,
        rol: user.rol
      },
      JWT_SECRET,
      { expiresIn: '1h' } // El token expira en 1 hora
    );

    return res.status(200).json({ token });
  });
});

// ======================================================
// Iniciar el servidor
// ======================================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
