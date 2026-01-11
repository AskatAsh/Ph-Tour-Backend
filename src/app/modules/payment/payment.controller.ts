import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";

const initPayment = catchAsync(async (req: Request, res: Response) => {
    const { bookingId } = req.params;

    const result = await PaymentService.initPayment(bookingId);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Payment Created Successfully",
        data: result
    })
});

const successPayment = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;

    const result = await PaymentService.successPayment(query as Record<string, string>);

    if (result.success) {
        res.redirect(`${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&status=${query.status}&message=${result.message}`);
    }
});

const failPayment = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;

    const result = await PaymentService.failPayment(query as Record<string, string>);

    if (!result.success) {
        res.redirect(`${envVars.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&status=${query.status}&message=${result.message}`);
    }
});

const cancelPayment = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;

    const result = await PaymentService.cancelPayment(query as Record<string, string>);

    if (!result.success) {
        res.redirect(`${envVars.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&status=${query.status}&message=${result.message}`);
    }
});

const getInvoiceDownloadUrl = catchAsync(async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const decodedToken = req.user as JwtPayload;
    const result = await PaymentService.getInvoiceDownloadUrl(paymentId, decodedToken);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Invoice download URL retrieved successfully",
        data: result,
    });
}
);

export const PaymentController = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceDownloadUrl
}