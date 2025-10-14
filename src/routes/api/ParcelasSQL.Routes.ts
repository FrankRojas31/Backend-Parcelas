import { Router } from 'express';
import { ParcelasSQLController } from '../../controller/api/ParcelasSQL.Controller';

const router = Router();
const parcelasController = new ParcelasSQLController();

// Rutas de Parcelas SQL
router.get('/', (req, res) => parcelasController.getAll(req, res));
router.get('/table', (req, res) => parcelasController.getForTable(req, res));
router.get('/:id', (req, res) => parcelasController.getById(req, res));
router.get('/usuario/:id_usuario', (req, res) => parcelasController.getByUsuario(req, res));
router.get('/search/:nombre', (req, res) => parcelasController.searchByName(req, res));
router.post('/', (req, res) => parcelasController.create(req, res));
router.put('/:id', (req, res) => parcelasController.update(req, res));
router.delete('/:id', (req, res) => parcelasController.delete(req, res));

export default router;

