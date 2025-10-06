import { Router } from 'express';
import { PersonaController } from '../../controller/api/Persona.Controller';

const router = Router();
const personaController = new PersonaController();

// Rutas de Persona
router.get('/', (req, res) => personaController.getAll(req, res));
router.get('/:id', (req, res) => personaController.getById(req, res));
router.get('/search/:nombre', (req, res) => personaController.searchByName(req, res));
router.post('/', (req, res) => personaController.create(req, res));
router.put('/:id', (req, res) => personaController.update(req, res));
router.delete('/:id', (req, res) => personaController.delete(req, res));

export default router;
