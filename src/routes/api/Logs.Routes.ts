import { Router } from 'express';
import { LogsController } from '../../controller/api/Logs.Controller';

const router = Router();
const logsController = new LogsController();

// Rutas de Logs
router.get('/', (req, res) => logsController.getAll(req, res));
router.get('/parcelas-eliminadas', (req, res) => logsController.getParcelasEliminadas(req, res));
router.get('/fecha', (req, res) => logsController.getByFecha(req, res));
router.get('/:id', (req, res) => logsController.getById(req, res));
router.get('/usuario/:id_usuario', (req, res) => logsController.getByUsuario(req, res));
router.get('/accion/:accion', (req, res) => logsController.getByAccion(req, res));
router.get('/entidad/:entidad', (req, res) => logsController.getByEntidad(req, res));
router.post('/', (req, res) => logsController.create(req, res));
router.delete('/:id', (req, res) => logsController.delete(req, res));

export default router;
