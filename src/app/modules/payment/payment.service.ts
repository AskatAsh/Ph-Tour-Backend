/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes';
import { uploadBufferToCloudinary } from '../../config/cloudinary.config';
import AppError from "../../errorHelpers/appError";
import { generatePdf, IInvoiceData } from '../../utils/invoice';
import { sendMail } from '../../utils/sendEmail';
import { BOOKING_STATUS } from "../booking/booking.interface";
import Booking from "../booking/booking.model";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { ITour } from '../tour/tour.interface';
import { IUser } from '../user/user.interface';
import { PAYMENT_STATUS } from "./payment.interface";
import Payment from "./payment.model";

const initPayment = async (bookingId: string) => {
    const payment = await Payment.findOne({ booking: bookingId });

    if (!payment) {
        throw new AppError(httpStatus.NOT_FOUND, "Payment Not Found. You have not booked this Tour.");
    }

    const booking = await Booking.findById(payment.booking);

    // sslCommerz payment
    const userName = (booking?.user as any).name;
    const userEmail = (booking?.user as any).email;
    const userPhone = (booking?.user as any).phone;
    const userAddress = (booking?.user as any).address;

    const sslPayload: ISSLCommerz = {
        name: userName,
        email: userEmail,
        phoneNumber: userPhone,
        address: userAddress,
        amount: payment.amount,
        transactionId: payment.transactionId
    }

    const sslPayment = await SSLService.sslPaymentInit(sslPayload);

    return {
        paymentUrl: sslPayment.GatewayPageURL,
    };
};

const successPayment = async (query: Record<string, string>) => {
    // start DB transaction
    const session = await Booking.startSession();
    session.startTransaction();

    try {
        // updated payment status
        const updatedPayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.PAID
        }, { runValidators: true, session: session })

        if (!updatedPayment) {
            throw new AppError(httpStatus.NOT_FOUND, "Payment not found")
        }

        // update booking status
        const updatedBooking = await Booking
            .findByIdAndUpdate(
                updatedPayment?.booking,
                { status: BOOKING_STATUS.COMPLETE },
                { new: true, runValidators: true, session }
            ).populate("tour", "title")
            .populate("user", "name email");

        if (!updatedBooking) {
            throw new AppError(httpStatus.NOT_FOUND, "Booking not found")
        }

        // generate invoice pdf and send to email
        const invoiceData: IInvoiceData = {
            bookingDate: updatedBooking.createdAt as Date,
            guestCount: updatedBooking.guestCount,
            totalAmount: updatedPayment?.amount as number,
            tourTitle: (updatedBooking.tour as unknown as ITour).title,
            transactionId: updatedPayment.transactionId,
            userName: (updatedBooking.user as unknown as IUser).name
        }
        const pdfBuffer = await generatePdf(invoiceData);

        const cloudinaryResult = await uploadBufferToCloudinary(pdfBuffer, "Invoice");

        await Payment.findByIdAndUpdate(updatedPayment._id, { invoiceUrl: cloudinaryResult?.secure_url }, { runValidators: true, session });

        await sendMail({
            to: (updatedBooking.user as unknown as IUser).email,
            subject: "Your Booking Invoice",
            templateName: "invoice",
            templateData: invoiceData,
            attachments: [
                {
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                    fileName: 'invoice.pdf'
                }
            ]
        })

        await session.commitTransaction(); // transaction
        session.endSession();

        return {
            success: true,
            message: "Payment Completed Successfully"
        };

    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession();
        throw error;
    }
};

const failPayment = async (query: Record<string, string>) => {
    // start DB transaction
    const session = await Booking.startSession();
    session.startTransaction();

    try {
        // updated payment status
        const updatePayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.FAILED
        }, { runValidators: true, session: session })

        // update booking status
        await Booking
            .findByIdAndUpdate(
                updatePayment?.booking,
                { status: BOOKING_STATUS.FAILED },
                { runValidators: true, session }
            );

        await session.commitTransaction(); // transaction
        session.endSession();

        return {
            success: false,
            message: "Payment Failed"
        };

    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession();
        throw error;
    }
};

const cancelPayment = async (query: Record<string, string>) => {
    // start DB transaction
    const session = await Booking.startSession();
    session.startTransaction();

    try {
        // updated payment status
        const updatePayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.CANCELLED
        }, { runValidators: true, session: session })

        // update booking status
        await Booking
            .findByIdAndUpdate(
                updatePayment?.booking,
                { status: BOOKING_STATUS.CANCEL },
                { runValidators: true, session }
            );

        await session.commitTransaction(); // transaction
        session.endSession();

        return {
            success: false,
            message: "Payment Cancelled"
        };

    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession();
        throw error;
    }
};

const getInvoiceDownloadUrl = async (paymentId: string) => {
    const payment = await Payment.findById(paymentId).select("invoiceUrl");

    if (!payment) {
        throw new AppError(401, "Payment not found")
    }

    if (!payment.invoiceUrl) {
        throw new AppError(401, "No invoice found")
    }

    return payment.invoiceUrl;
};

export const PaymentService = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceDownloadUrl
}