import { Request, Response } from "express";
import { ParcelaService } from "../../services/api/Parcela.Service";

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

export const GetParcelas = async (req: Request, res: Response) => {
    try {
        const response = await ParcelaService().getParcelas();
        if (response.success) {
            res.status(200).send(response);
        } else {
            res.status(404).send(response);
        }
    } catch (error) {
        res.status(500).send("Error al obtener parcelas: " + error);
    }
};

export const GetParcelasWithResponsables = async (req: Request, res: Response) => {
    try {
        const response = await ParcelaService().getParcelasWithResponsables();
        if (response.success) {
            res.status(200).send(response);
        } else {
            res.status(404).send(response);
        }
    } catch (error) {
        res.status(500).send("Error al obtener parcelas con responsables: " + error);
    }
};
