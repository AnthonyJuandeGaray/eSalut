import express from 'express';
import {
  crearNotificacion,
  obtenerNotificacionesPorUsuario,
  marcarComoLeida,
  eliminarNotificacion
} from '../controllers/notificacion.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/crear', (req, res) => {
  requireAuth(req, res, () => crearNotificacion(req, res));
});

router.get('/usuario/:id', (req, res) => {
  requireAuth(req, res, () => obtenerNotificacionesPorUsuario(req, res));
});

router.put('/:id/leida', (req, res) => {
  requireAuth(req, res, () => marcarComoLeida(req, res));
});

router.delete('/:id', (req, res) => {
  requireAuth(req, res, () => eliminarNotificacion(req, res));
});

export default router;
