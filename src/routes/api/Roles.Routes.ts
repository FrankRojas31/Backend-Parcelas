import { Router } from 'express';
import { RolesController } from '../../controller/api/Roles.Controller';

const router = Router();
const rolesController = new RolesController();

// Rutas de Roles
router.get('/', (req, res) => rolesController.getAll(req, res));
router.get('/:id', (req, res) => rolesController.getById(req, res));
router.get('/nombre/:nombre', (req, res) => rolesController.getByName(req, res));
router.post('/', (req, res) => rolesController.create(req, res));
router.put('/:id', (req, res) => rolesController.update(req, res));
router.delete('/:id', (req, res) => rolesController.delete(req, res));

export default router;
