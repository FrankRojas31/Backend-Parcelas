import { Router } from "express";
import { router as parcelasRoutes } from "./api/Parcelas.Routes";
import parcelasSQLRoutes from "./api/ParcelasSQL.Routes";
import usuariosRoutes from "./api/Usuarios.Routes";
import rolesRoutes from "./api/Roles.Routes";
import logsRoutes from "./api/Logs.Routes";
import personaRoutes from "./api/Persona.Routes";
import externalRoutes from "./external/route";

const router = Router();

router.use("/parcelas", parcelasRoutes);
router.use("/parcelas-sql", parcelasSQLRoutes);
router.use("/usuarios", usuariosRoutes);
router.use("/roles", rolesRoutes);
router.use("/logs", logsRoutes);
router.use("/personas", personaRoutes);
router.use("/external", externalRoutes);

export default router;