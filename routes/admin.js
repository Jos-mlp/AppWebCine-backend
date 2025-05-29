// backend/routes/adminReporte.js

const express = require('express');
const router = express.Router();
const pool = require('../db');
const dayjs = require('dayjs');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const PRECIO_POR_BUTACA = 32;

router.get(
  '/report',
  authenticateToken,
  authorizeRole('admin'),
  async (req, res) => {
    try {
      const resultados = [];
      const hoy = dayjs();

      for (let i = 1; i <= 8; i++) {
        const fecha = hoy.add(i, 'day').format('YYYY-MM-DD');

        const [[{ reservedCount }]] = await pool.query(
          `SELECT COUNT(*) AS reservedCount
           FROM estado_asiento
           WHERE fecha = ? AND estado IN ('Reservado', 'Ocupado')`,
          [fecha]
        );

        const [[{ availableCount }]] = await pool.query(
          `SELECT COALESCE(SUM(s.filas * s.columnas), 0) AS availableCount
           FROM funcion_pelicula f
           JOIN sala s ON f.id_sala = s.id_sala
           WHERE f.fecha = ?`,
          [fecha]
        );

        const lostCount = Math.max(availableCount - reservedCount, 0);
        const income = reservedCount * PRECIO_POR_BUTACA;
        const lostIncome = lostCount * PRECIO_POR_BUTACA;

        resultados.push({
          fecha,
          reservedCount,
          income,
          lostIncome
        });
      }

      // Devuelve un array de objetos directamente:
      return res.json(resultados);
    } catch (err) {
      console.error('Error en /admin/report:', err);
      return res.status(500).json({ error: 'Error al generar reporte' });
    }
  }
);

module.exports = router;
