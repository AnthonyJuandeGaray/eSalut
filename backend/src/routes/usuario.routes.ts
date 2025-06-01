import express from 'express';
import {
  listarUsuarios,
  eliminarUsuario,
  verificarUsuario,
  editarUsuario
} from '../controllers/usuario.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = express.Router();

// Listar todos los usuarios (solo ADMIN)
router.get('/', (req, res) => {
  requireAuth(req, res, () => {
    requireRole('ADMIN')(req, res, () => listarUsuarios(req, res));
  });
});

// Verificar un usuario (solo ADMIN)
router.put('/:id/verificar', (req, res) => {
  requireAuth(req, res, () => {
    requireRole('ADMIN')(req, res, () => verificarUsuario(req, res));
  });
});

// Eliminar un usuario (solo ADMIN)
router.delete('/:id', (req, res) => {
  requireAuth(req, res, () => {
    requireRole('ADMIN')(req, res, () => eliminarUsuario(req, res));
  });
});

// Editar un usuario (nombre, email, rol) (solo ADMIN)
router.put('/:id', (req, res) => {
  requireAuth(req, res, () => {
    requireRole('ADMIN')(req, res, () => editarUsuario(req, res));
  });
});

export default router;
