import { Router } from 'express';
import { UsuariosController } from '../../controller/api/Usuarios.Controller';

const router = Router();
const usuariosController = new UsuariosController();

// Rutas de Usuarios
router.get('/', (req, res) => usuariosController.getAll(req, res));
router.get('/:id', (req, res) => usuariosController.getById(req, res));
router.get('/username/:username', (req, res) => usuariosController.getByUsername(req, res));
router.get('/email/:email', (req, res) => usuariosController.getByEmail(req, res));
router.get('/role/:id_role', (req, res) => usuariosController.getByRole(req, res));
router.post('/', (req, res) => usuariosController.create(req, res));
router.post('/login', (req, res) => usuariosController.login(req, res));
router.put('/:id', (req, res) => usuariosController.update(req, res));
router.delete('/:id', (req, res) => usuariosController.delete(req, res));

export default router;
