import express from 'express';
import { registerUser, loginUser, getProfile } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = express.Router();

// Registro de usuario
router.post('/register', (req, res) => {
  registerUser(req, res);
});

// Login de usuario
router.post('/login', (req, res) => {
  loginUser(req, res);
});

// Perfil del usuario autenticado
router.get('/profile', requireAuth, (req, res) => {
  getProfile(req, res);
});

export default router;
