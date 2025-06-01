import express from 'express';
import {
  listarMedicos,
  obtenerMedicoPorId,
  actualizarEspecialidad,
  eliminarMedico,
  getAllMedicosPublicos // ✅ nuevo
} from '../controllers/medico.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = express.Router();

// ✅ Ruta pública antes de las protegidas
router.get('/public', getAllMedicosPublicos);

// 🔒 Rutas protegidas
router.get('/', (req, res) => {
  requireAuth(req, res, () => {
    requireRole('ADMIN')(req, res, () => listarMedicos(req, res));
  });
});

router.get('/:id', (req, res) => {
  requireAuth(req, res, () => {
    requireRole('ADMIN')(req, res, () => obtenerMedicoPorId(req, res));
  });
});

router.put('/:id', (req, res) => {
  requireAuth(req, res, () => {
    requireRole('ADMIN')(req, res, () => actualizarEspecialidad(req, res));
  });
});

router.delete('/:id', (req, res) => {
  requireAuth(req, res, () => {
    requireRole('ADMIN')(req, res, () => eliminarMedico(req, res));
  });
});

export default router;
