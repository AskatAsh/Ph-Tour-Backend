import { Router } from "express";
import { multerUpload } from "../../config/multer.config";
import { validateRequest } from "../../middlewares/validateRequest";
import { verifyUser } from "../../middlewares/verifyUser";
import { UserControllers } from "./user.controller";
import { Role } from "./user.interface";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";

const router = Router();

router.post('/register', multerUpload.single("file"), validateRequest(createUserZodSchema), UserControllers.createUser);
router.patch('/:id', verifyUser(...Object.values(Role)), multerUpload.single("file"), validateRequest(updateUserZodSchema), UserControllers.updateUser);
router.get('/:id', verifyUser(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getSingleUser);
router.get('/all-users', verifyUser(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUsers);
router.get('/me', verifyUser(...Object.values(Role)), UserControllers.getMe);

export const UserRoutes = router;