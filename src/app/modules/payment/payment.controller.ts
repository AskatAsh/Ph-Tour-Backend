import { Request, Response } from "express";
import { envVars } from "../../config/env";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.service";

const successPayment = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;

    const result = await PaymentService.successPayment(query as Record<string, string>);

    if (result.success) {
        res.redirect(`${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&status=${query.status}&message=${result.message}`);
    }
});

const failPayment = catchAsync(async (req: Request, res: Response) => {

});

const cancelPayment = catchAsync(async (req: Request, res: Response) => {

});

export const PaymentController = {
    successPayment,
    failPayment,
    cancelPayment
}