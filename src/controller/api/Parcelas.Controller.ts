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
