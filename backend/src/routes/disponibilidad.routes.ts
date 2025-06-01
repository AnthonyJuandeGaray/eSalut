import express from 'express';
import {
  obtenerDisponibilidad,
  crearDisponibilidad,
  eliminarDisponibilidad
} from '../controllers/disponibilidad.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = express.Router();

// Obtener disponibilidad del médico autenticado
router.get('/mis-franjas', (req, res) => {
  requireAuth(req, res, () => {
    requireRole('MEDICO')(req, res, () => obtenerDisponibilidad(req, res));
  });
});

// Crear nueva franja de disponibilidad
router.post('/', (req, res) => {
  requireAuth(req, res, () => {
    requireRole('MEDICO')(req, res, () => crearDisponibilidad(req, res));
  });
});

// Eliminar franja por ID
router.delete('/:id', (req, res) => {
  requireAuth(req, res, () => {
    requireRole('MEDICO')(req, res, () => eliminarDisponibilidad(req, res));
  });
});

export default router;
