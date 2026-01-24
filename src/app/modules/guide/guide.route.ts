import { Router } from "express";
import { multerUpload } from "../../config/multer.config";
import { validateRequest } from "../../middlewares/validateRequest";
import { verifyUser } from "../../middlewares/verifyUser";
import { Role } from "../user/user.interface";
import { GuideControllers } from "./guide.controller";
import { applyAsGuideZodSchema, approveGuideZodSchema } from "./guide.validation";

const router = Router();

// api/v1/guide/apply
router.post("/apply", verifyUser(Role.USER), multerUpload.single("file"), validateRequest(applyAsGuideZodSchema), GuideControllers.applyAsGuide);
// api/v1/guide/approve/:id
router.post("/approve/:id", verifyUser(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(approveGuideZodSchema), GuideControllers.approveGuideApplication);
// api/v1/guide/:id
router.get("/:id", verifyUser(Role.ADMIN, Role.SUPER_ADMIN), GuideControllers.getSingleGuide); // optional
// api/v1/guide
router.get("/", verifyUser(Role.ADMIN, Role.SUPER_ADMIN), GuideControllers.getAppliedGuides);

export const GuideRoutes = router;