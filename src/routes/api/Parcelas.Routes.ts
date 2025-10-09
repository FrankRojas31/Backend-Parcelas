import { Router } from "express";
import { PostParcelas, GetParcelas, GetParcelasWithResponsables } from "../../controller/api/Parcelas.Controller";

export const router = Router();

router.get("/", GetParcelas);
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Test endpoint funcionando", data: [] });
});
router.get("/with-responsables", GetParcelasWithResponsables);
router.post("/post-parcelas", PostParcelas);