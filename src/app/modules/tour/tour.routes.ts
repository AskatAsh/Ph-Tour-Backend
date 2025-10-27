
import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { verifyUser } from "../../middlewares/verifyUser";
import { Role } from "../user/user.interface";
import { TourControllers } from "./tour.controller";
import { createTourTypeZodSchema, createTourZodSchema } from "./tour.validation";


const router = Router();

// routes for tour-type
router.post('/create-tour-type', verifyUser(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(createTourTypeZodSchema), TourControllers.createTourType);

router.post('/create', verifyUser(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(createTourZodSchema), TourControllers.createTour);

export const TourRoutes = router;