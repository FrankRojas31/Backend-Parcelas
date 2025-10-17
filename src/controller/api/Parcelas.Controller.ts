import { Request, Response } from "express";
import { ParcelaService } from "../../services/api/Parcela.Service";
import { ParcelasMongoService } from "../../services/api/ParcelasMongo.Service";
import { ParcelasRepositorySQL } from "../../repository/api/ParcelasSQL.Repository";
import { SensorsService } from "../../services/external/Sensors.Service";
import { ResponseHelperClass } from "../../types/api/ResponseHelper";

const parcelasMongoService = new ParcelasMongoService();
const parcelasRepositorySQL = new ParcelasRepositorySQL();
const sensorsService = new SensorsService();

export const PostParcelas = async (req: Request, res: Response) => {
    try {
        const response = await ParcelaService().postParcelas();
        if (response.success) {
            res.status(201).send(response);
        } else {
            res.status(400).send(response);
        }
    } catch (error) {
        res.status(500).send("Error al crear parcela: " + error);
    }
};

// Nueva función para obtener todas las parcelas de MongoDB
export const GetParcelasMongo = async (req: Request, res: Response) => {
    try {
        const parcelas = await parcelasMongoService.getAllParcelasMongo();
        return ResponseHelperClass.success(res, parcelas, 'Parcelas de MongoDB obtenidas exitosamente');
    } catch (error: any) {
        return ResponseHelperClass.error(res, error.message, 500);
    }
};

// Nueva función para obtener parcelas con filtros
export const GetParcelasMongoFiltered = async (req: Request, res: Response) => {
    try {
        const filters = req.query;
        const parcelas = await parcelasMongoService.filterParcelas(filters as any);
        return ResponseHelperClass.success(res, parcelas, 'Parcelas filtradas exitosamente');
    } catch (error: any) {
        return ResponseHelperClass.error(res, error.message, 500);
    }
};

// Nueva función para obtener datos agrupados por coordenadas
export const GetParcelasGrouped = async (req: Request, res: Response) => {
    try {
        const response = await ParcelaService().getGroupedParcelas();
        if (response.success) {
            res.status(200).send(response);
        } else {
            res.status(500).send(response);
        }
    } catch (error) {
        res.status(500).send("Error al obtener parcelas agrupadas: " + error);
    }
};

// Nueva función para obtener parcelas con información de responsables (MongoDB + SQL)
export const GetParcelasWithResponsables = async (req: Request, res: Response) => {
    try {
        // Obtener todos los sensores usando el servicio de sensores
        const sensorsByType = await sensorsService.getAllSensors();
        
        // Convertir el objeto de sensores agrupados por tipo en un array plano
        const flatSensors = Object.entries(sensorsByType)
            .flatMap(([type, arr]) =>
                Array.isArray(arr)
                    ? arr.map(sensor => ({ ...sensor, type }))
                    : []
            );
        
        // Obtener todas las parcelas SQL con información de usuario
        const parcelasSQL = await parcelasRepositorySQL.getAll();
        
        // Crear un mapa de parcelas SQL por parcelaMg_Id para búsqueda rápida
        const parcelasSQLMap = new Map();
        parcelasSQL.forEach((parcelaSQL: any) => {
            if (parcelaSQL.parcelaMg_Id) {
                parcelasSQLMap.set(parcelaSQL.parcelaMg_Id, parcelaSQL);
            }
        });
        
        // Agrupar sensores por _id (si existe) o por coordenadas
        const sensorsGroupedById = new Map();
        flatSensors.forEach((sensor: any) => {
            const id = sensor._id?.toString() || `${sensor.coords.lat}_${sensor.coords.lon}`;
            if (!sensorsGroupedById.has(id)) {
                sensorsGroupedById.set(id, []);
            }
            sensorsGroupedById.get(id).push(sensor);
        });
        
        // Combinar datos
        const parcelasWithResponsables = Array.from(sensorsGroupedById.entries()).map(([id, sensors]: [string, any[]]) => {
            const firstSensor = sensors[0];
            const parcelaSQL = parcelasSQLMap.get(id);
            
            // Construir el objeto de sensores dinámicamente
            const sensoresObj: any = {};
            sensors.forEach((sensor: any) => {
                const sensorType = sensor.type || 'temperatura';
                if (!sensoresObj[sensorType]) {
                    sensoresObj[sensorType] = [];
                }
                sensoresObj[sensorType].push({
                    value: sensor.value || 0,
                    unit: sensor.unit || (sensorType === 'humedad' ? '%' : sensorType === 'lluvia' ? 'mm' : sensorType === 'radiacion_solar' ? 'W/m²' : '°C'),
                    timestamp: sensor.timestamp || new Date().toISOString(),
                    coords: sensor.coords || { lat: 0, lon: 0 },
                    type: sensorType
                });
            });
            
            return {
                _id: firstSensor._id || id,
                coords: firstSensor.coords || { lat: 0, lon: 0 },
                sensores: sensoresObj,
                timestamp: firstSensor.timestamp,
                isDeleted: firstSensor.isDeleted || false,
                sqlData: parcelaSQL || null,
                hasResponsable: !!parcelaSQL,
                responsable: parcelaSQL ? {
                    id: parcelaSQL.Tbl_Usuarios?.id,
                    username: parcelaSQL.Tbl_Usuarios?.username,
                    email: parcelaSQL.Tbl_Usuarios?.email,
                    persona: parcelaSQL.Tbl_Usuarios?.Tbl_Persona ? {
                        nombre: parcelaSQL.Tbl_Usuarios.Tbl_Persona.nombre,
                        apellido_paterno: parcelaSQL.Tbl_Usuarios.Tbl_Persona.apellido_paterno,
                        apellido_materno: parcelaSQL.Tbl_Usuarios.Tbl_Persona.apellido_materno
                    } : null
                } : null,
                nombre: parcelaSQL?.nombre || null
            };
        });
        
        return ResponseHelperClass.success(res, parcelasWithResponsables, 'Parcelas con responsables obtenidas exitosamente');
    } catch (error: any) {
        return ResponseHelperClass.error(res, error.message, 500);
    }
};
