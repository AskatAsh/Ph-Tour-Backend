import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { verifyUser } from "../../middlewares/verifyUser";
import { Role } from "../user/user.interface";
import { DivisionControllers } from "./division.controller";
import { createDivisionZodSchema } from "./division.validation";

const router = Router();

router.post('/', verifyUser(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(createDivisionZodSchema), DivisionControllers.createDivision);

export const DivisionRoutes = router;