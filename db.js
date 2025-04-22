const mysql = require('mysql2/promise');

// Configuración de la conexión a la base de datos MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'bdcine',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;