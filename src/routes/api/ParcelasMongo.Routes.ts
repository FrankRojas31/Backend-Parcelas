import { Router } from 'express';
import { ParcelasMongoController } from '../../controller/api/ParcelasMongo.Controller';

const router = Router();
const parcelasMongoController = new ParcelasMongoController();

// Rutas de utilidades (deben ir antes de las rutas con parámetros)
router.get('/utils/example-id', (req, res) => parcelasMongoController.getExampleId(req, res));
router.get('/utils/validate-id/:id', (req, res) => parcelasMongoController.validateId(req, res));

// Rutas de Parcelas MongoDB
router.get('/', (req, res) => parcelasMongoController.getAll(req, res));
router.get('/stats', (req, res) => parcelasMongoController.getStats(req, res));
router.get('/filter', (req, res) => parcelasMongoController.filter(req, res));
router.get('/coordinates', (req, res) => parcelasMongoController.getByCoordinates(req, res));
router.get('/date-range', (req, res) => parcelasMongoController.getByDateRange(req, res));
router.get('/value-range', (req, res) => parcelasMongoController.getByValueRange(req, res));
router.get('/unit/:unit', (req, res) => parcelasMongoController.getByUnit(req, res));
router.get('/:id', (req, res) => parcelasMongoController.getById(req, res));
router.post('/', (req, res) => parcelasMongoController.create(req, res));
router.put('/:id', (req, res) => parcelasMongoController.update(req, res));
router.delete('/:id', (req, res) => parcelasMongoController.delete(req, res));

export default router;