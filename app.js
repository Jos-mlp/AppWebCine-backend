require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

// Conexión a BD y pool
const pool = require('./db');
app.locals.pool = pool;

// Integrar login/register (no modificar)
const authRouter = require('./login');
app.use('/', authRouter);

// Middlewares de autenticación
const { authenticateToken } = require('./middleware/auth');

// Rutas
app.use('/salas', authenticateToken, require('./routes/salas'));
app.use('/funciones', authenticateToken, require('./routes/funciones'));
app.use('/reservas', authenticateToken, require('./routes/reservas'));
// Rutas de usuario (sólo admin)
const { authorizeRole } = require('./middleware/auth');
app.use('/usuarios', authenticateToken, authorizeRole('admin'), require('./routes/usuarios'));

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));