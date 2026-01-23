import { Router } from "express";
import { verifyUser } from "../../middlewares/verifyUser";
import { Role } from "../user/user.interface";
import { PaymentController } from "./payment.controller";

const router = Router();

router.post("/init-payment/:bookingId", PaymentController.initPayment);
router.post("/success", PaymentController.successPayment);
router.post("/fail", PaymentController.failPayment);
router.post("/cancel", PaymentController.cancelPayment);
router.get("/invoice/:paymentId", verifyUser(...Object.values(Role)), PaymentController.getInvoiceDownloadUrl);
router.post("/validate-payment", PaymentController.validatePayment);

export const PaymentRoutes = router;