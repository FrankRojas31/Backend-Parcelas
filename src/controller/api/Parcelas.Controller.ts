import { Request, Response } from "express";
import { ParcelaService } from "../../services/api/Parcela.Service";
import { ParcelasMongoService } from "../../services/api/ParcelasMongo.Service";
import { ResponseHelperClass } from "../../types/api/ResponseHelper";

const parcelasMongoService = new ParcelasMongoService();

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
