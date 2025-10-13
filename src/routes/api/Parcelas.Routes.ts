import { Router } from "express";
import { PostParcelas, GetParcelasMongo, GetParcelasMongoFiltered, GetParcelasGrouped } from "../../controller/api/Parcelas.Controller";

export const router = Router();

router.post("/post-parcelas", PostParcelas);
router.get("/get-parcelas-mongo", GetParcelasMongo);
router.get("/get-parcelas-filtered", GetParcelasMongoFiltered);
router.get("/get-parcelas-grouped", GetParcelasGrouped);