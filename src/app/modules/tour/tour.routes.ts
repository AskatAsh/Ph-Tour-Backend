
import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { verifyUser } from "../../middlewares/verifyUser";
import { Role } from "../user/user.interface";
import { TourControllers } from "./tour.controller";
import { createTourTypeZodSchema, createTourZodSchema, updateTourZodSchema } from "./tour.validation";


const router = Router();
// routes for tours
router.post('/create', verifyUser(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(createTourZodSchema), TourControllers.createTour);

router.get('/', TourControllers.getAllTour);

router.patch(
    "/:id",
    verifyUser(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(updateTourZodSchema),
    TourControllers.updateTour
);

router.delete(
    "/:id",
    verifyUser(Role.ADMIN, Role.SUPER_ADMIN),
    TourControllers.deleteTour
);

// routes for tour-type
router.post('/create-tour-type', verifyUser(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(createTourTypeZodSchema), TourControllers.createTourType);

router.get('/tour-types', TourControllers.getAllTourType);

router.patch(
    "/tour-types/:id",
    verifyUser(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(createTourTypeZodSchema),
    TourControllers.updateTourType
);

router.delete(
    "/tour-types/:id",
    verifyUser(Role.ADMIN, Role.SUPER_ADMIN),
    TourControllers.deleteTourType
);


export const TourRoutes = router;