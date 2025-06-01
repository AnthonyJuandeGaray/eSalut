import express from 'express';
import {
  obtenerMedicamentos,
  crearMedicamento,
  editarMedicamento,
  eliminarMedicamento
} from '../controllers/medicamento.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = express.Router();

// Obtener medicamentos (cualquiera autenticado)
router.get('/', (req, res) => {
  requireAuth(req, res, () => obtenerMedicamentos(req, res));
});

// Crear medicamento (solo admin)
router.post('/', (req, res) => {
  requireAuth(req, res, () =>
    requireRole('ADMIN')(req, res, () => crearMedicamento(req, res))
  );
});

// Editar medicamento (solo admin)
router.put('/:id', (req, res) => {
  requireAuth(req, res, () =>
    requireRole('ADMIN')(req, res, () => editarMedicamento(req, res))
  );
});

// Eliminar medicamento (solo admin)
router.delete('/:id', (req, res) => {
  requireAuth(req, res, () =>
    requireRole('ADMIN')(req, res, () => eliminarMedicamento(req, res))
  );
});

export default router;
