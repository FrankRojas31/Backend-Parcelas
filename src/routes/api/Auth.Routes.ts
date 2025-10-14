import { Router } from 'express';
import { AuthController } from '../../controller/api/Auth.Controller';

const router = Router();
const authController = new AuthController();

// Rutas de Autenticación
router.post('/login', (req, res) => authController.login(req, res));
router.post('/register', (req, res) => authController.register(req, res));
router.post('/verify-token', (req, res) => authController.verifyToken(req, res));

export default router;