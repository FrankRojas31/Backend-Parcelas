import { Router } from "express";
import { PostParcelas } from "../../controller/api/Parcelas.Controller";

export const router = Router();

router.post("/post-parcelas", PostParcelas);