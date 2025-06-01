import express from 'express';
import {
  crearCita,
  obtenerCitasPorUsuario,
  obtenerCitasPorMedico,
  editarCita,
  actualizarEstadoCita,
  aceptarCitaConHora,
  obtenerTodasLasCitas // ✅ NUEVO
} from '../controllers/cita.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = express.Router();

// Crear nueva cita (usuario autenticado)
router.post('/crear', (req, res) => {
  requireAuth(req, res, () => crearCita(req, res));
});

// Obtener citas del usuario autenticado
router.get('/mis-citas', (req, res) => {
  requireAuth(req, res, () => obtenerCitasPorUsuario(req, res));
});

// Obtener citas del médico autenticado
router.get('/medico', (req, res) => {
  requireAuth(req, res, () => obtenerCitasPorMedico(req, res));
});

router.get('/admin', (req, res) => {
  requireAuth(req, res, () =>
    requireRole('ADMIN')(req, res, () => obtenerTodasLasCitas(req, res))
  );
});

// Editar cita por ID
router.put('/:id', (req, res) => {
  requireAuth(req, res, () => editarCita(req, res));
});

// Actualizar solo el estado de una cita
router.patch('/:id/estado', (req, res) => {
  requireAuth(req, res, () => actualizarEstadoCita(req, res));
});

// Aceptar cita con nueva hora
router.patch('/:id/aceptar', (req, res) => {
  requireAuth(req, res, () => aceptarCitaConHora(req, res));
});

export default router;
