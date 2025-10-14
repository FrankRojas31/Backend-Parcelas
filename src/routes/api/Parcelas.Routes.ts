import { Router } from "express";
import { PostParcelas, GetParcelasMongo, GetParcelasMongoFiltered, GetParcelasGrouped, GetParcelasWithResponsables } from "../../controller/api/Parcelas.Controller";

export const router = Router();

// Ruta raíz - alias para get-parcelas-mongo
router.get("/", GetParcelasMongo);

// Ruta para obtener parcelas con responsables (MongoDB + SQL)
router.get("/with-responsables", GetParcelasWithResponsables);

router.post("/post-parcelas", PostParcelas);
router.get("/get-parcelas-mongo", GetParcelasMongo);
router.get("/get-parcelas-filtered", GetParcelasMongoFiltered);
router.get("/get-parcelas-grouped", GetParcelasGrouped);