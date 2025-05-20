require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importamos cors

const app = express();

// Middleware para permitir peticiones desde el frontend
app.use(cors());
app.use(bodyParser.json());

// Conexión a BD y pool
const pool = require('./db');
app.locals.pool = pool;

// Integrar login y register desde archivos separados
const loginRouter = require('./auth/login');
const registerRouter = require('./auth/register');
app.use('/', loginRouter);
app.use('/', registerRouter);

// Middlewares de autenticación/roles
const { authenticateToken, authorizeRole } = require('./middleware/auth');

// Rutas protegidas
app.use('/salas', authenticateToken, require('./routes/salas'));
app.use('/funciones', authenticateToken, require('./routes/funciones'));
app.use('/reservas', authenticateToken, require('./routes/reservas'));

// Rutas de usuario (sólo admin)
// Aquí se monta el router de usuarios, que incluye:
//   GET  /usuarios/habilitados
//   GET  /usuarios/:id
//   PUT  /usuarios/:id/disable
app.use(
  '/usuarios',
  authenticateToken,
  authorizeRole('admin'),
  require('./routes/usuarios')
);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
