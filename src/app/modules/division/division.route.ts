import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { verifyUser } from "../../middlewares/verifyUser";
import { Role } from "../user/user.interface";
import { DivisionControllers } from "./division.controller";
import { createDivisionZodSchema } from "./division.validation";

const router = Router();

router.post('/create', verifyUser(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(createDivisionZodSchema), DivisionControllers.createDivision);
router.get('/', DivisionControllers.getAllDivisions);
router.get('/:id', DivisionControllers.getSingleDivision);
router.patch('/:id', verifyUser(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(createDivisionZodSchema), DivisionControllers.updateDivision);

export const DivisionRoutes = router;