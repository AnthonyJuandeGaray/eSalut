import { Router } from 'express';
import authRoutes from './auth.routes';
import usuarioRoutes from './usuario.routes';
import citaRoutes from './cita.routes';
import medicoRoutes from './medico.routes';
import especialidadRoutes from './especialidad.routes';
import disponibilidadRoutes from './disponibilidad.routes';
const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/citas', citaRoutes);
router.use('/medicos', medicoRoutes);
router.use('/especialidades', especialidadRoutes);
router.use('/disponibilidad', disponibilidadRoutes);
export default router;
