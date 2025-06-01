import { Router } from 'express';
import { crearDocumento, getDocumentosPorUsuario, getMedicamentos } from '../controllers/documento.controller';

const router = Router();

router.post('/', crearDocumento);
router.get('/usuario', getDocumentosPorUsuario);
router.get('/medicamentos', getMedicamentos);

export default router;
