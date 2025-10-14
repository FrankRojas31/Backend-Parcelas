import { Router } from 'express';
import { SensorsController } from '../../controller/external/Sensors.Controller';

const router = Router();
const sensorsController = new SensorsController();

// Rutas de información general
router.get('/types', (req, res) => sensorsController.getAvailableTypes(req, res));
router.get('/stats', (req, res) => sensorsController.getStats(req, res));

// Rutas de datos agrupados y coordenadas
router.get('/grouped', (req, res) => sensorsController.getGrouped(req, res));
router.get('/coordinates/unique', (req, res) => sensorsController.getUniqueCoordinates(req, res));
router.get('/coordinates', (req, res) => sensorsController.getByCoordinates(req, res));

// Rutas de filtrado
router.get('/date-range', (req, res) => sensorsController.getByDateRange(req, res));
router.get('/filter/:type', (req, res) => sensorsController.filterByValue(req, res));

// Rutas por tipo específico

// Rutas directas para tipos de sensores específicos (compatibilidad frontend)
router.get('/humedad', (req, res) => {
	Object.assign(req.params, { type: 'humedad' });
	sensorsController.getByType(req, res);
});
router.get('/temperatura', (req, res) => {
	Object.assign(req.params, { type: 'temperatura' });
	sensorsController.getByType(req, res);
});
router.get('/lluvia', (req, res) => {
	Object.assign(req.params, { type: 'lluvia' });
	sensorsController.getByType(req, res);
});

router.get('/type/:type', (req, res) => sensorsController.getByType(req, res));

// Ruta general (debe ir al final)
router.get('/', (req, res) => sensorsController.getAll(req, res));

export default router;