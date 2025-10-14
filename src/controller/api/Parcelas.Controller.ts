import { Request, Response } from "express";
import { ParcelaService } from "../../services/api/Parcela.Service";
import { ParcelasMongoService } from "../../services/api/ParcelasMongo.Service";
import { ParcelasRepositorySQL } from "../../repository/api/ParcelasSQL.Repository";
import { ResponseHelperClass } from "../../types/api/ResponseHelper";

const parcelasMongoService = new ParcelasMongoService();
const parcelasRepositorySQL = new ParcelasRepositorySQL();

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
        // Obtener todas las parcelas de MongoDB
        const parcelasMongo = await parcelasMongoService.getAllParcelasMongo();
        
        // Obtener todas las parcelas SQL con información de usuario
        const parcelasSQL = await parcelasRepositorySQL.getAll();
        
        // Crear un mapa de parcelas SQL por parcelaMg_Id para búsqueda rápida
        const parcelasSQLMap = new Map();
        parcelasSQL.forEach((parcelaSQL: any) => {
            if (parcelaSQL.parcelaMg_Id) {
                parcelasSQLMap.set(parcelaSQL.parcelaMg_Id, parcelaSQL);
            }
        });
        
        // Combinar datos
        const parcelasWithResponsables = parcelasMongo.map((parcelaMongo: any) => {
            const parcelaSQL = parcelasSQLMap.get(parcelaMongo._id.toString());
            
            return {
                _id: parcelaMongo._id,
                coords: parcelaMongo.coords || { lat: 0, lon: 0 },
                sensores: parcelaMongo.sensores || {
                    // Crear la estructura de sensores dinámicamente según el tipo
                    [parcelaMongo.type || 'temperatura']: [{
                        value: parcelaMongo.value || 0,
                        unit: parcelaMongo.unit || (parcelaMongo.type === 'humedad' ? '%' : parcelaMongo.type === 'lluvia' ? 'mm' : parcelaMongo.type === 'radiacion_solar' ? 'W/m²' : '°C'),
                        timestamp: parcelaMongo.timestamp || new Date().toISOString(),
                        coords: parcelaMongo.coords || { lat: 0, lon: 0 },
                        type: parcelaMongo.type || 'temperatura'
                    }]
                },
                timestamp: parcelaMongo.timestamp,
                isDeleted: parcelaMongo.isDeleted || false,
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
