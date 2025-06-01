import express from 'express';
import {
  crearEspecialidad,
  listarEspecialidades,
  obtenerEspecialidadPorId,
  actualizarEspecialidad,
  eliminarEspecialidad
} from '../controllers/especialidad.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = express.Router();

// Crear especialidad (solo ADMIN)
router.post('/crear', (req, res) => {
  requireAuth(req, res, () => {
    requireRole('ADMIN')(req, res, () => crearEspecialidad(req, res));
  });
});

// Listar todas
router.get('/', (req, res) => {
  listarEspecialidades(req, res);
});

// Ver por ID
router.get('/:id', (req, res) => {
  obtenerEspecialidadPorId(req, res);
});

// Modificar (solo ADMIN)
router.put('/:id', (req, res) => {
  requireAuth(req, res, () => {
    requireRole('ADMIN')(req, res, () => actualizarEspecialidad(req, res));
  });
});

// Eliminar (solo ADMIN)
router.delete('/:id', (req, res) => {
  requireAuth(req, res, () => {
    requireRole('ADMIN')(req, res, () => eliminarEspecialidad(req, res));
  });
});

export default router;
