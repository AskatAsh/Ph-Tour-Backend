/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import Payment from "../payment/payment.model";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { Tour } from "../tour/tour.model";
import User from "../user/user.model";
import { bookingSearchableFields } from "./booking.constant";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import Booking from "./booking.model";

const getTransactionId = () => {
    return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// service function to create booking
const createBooking = async (payload: Partial<IBooking>, userId: string) => {
    const transactionId = getTransactionId();

    // start DB transaction
    const session = await Booking.startSession();
    session.startTransaction();

    try {
        // find and check if user phone or address exists
        const user = await User.findById(userId);
        if (!user?.phone || !user.address) {
            throw new AppError(httpStatus.BAD_REQUEST, "User Phone and Address Required to Book A Tour.")
        }

        // find tour cost and check if cost exists
        const tour = await Tour.findById(payload.tour).select("costFrom");
        if (!tour?.costFrom) {
            throw new AppError(httpStatus.BAD_GATEWAY, "No Tour Cost Found!")
        }

        // calculate tour cost amount
        const amount = Number(tour.costFrom) * Number(payload.guestCount);

        // create booking from payload, verified user and status
        const booking = await Booking.create([{
            ...payload,
            user: userId,
            status: BOOKING_STATUS.PENDING
        }], { session })

        // create payment with booking
        const payment = await Payment.create([{
            booking: booking[0]._id,
            transactionId: transactionId,
            amount: amount,
            status: PAYMENT_STATUS.UNPAID
        }], { session })

        // update booking with payment id
        const updatedBooking = await Booking
            .findByIdAndUpdate(
                booking[0]._id,
                { payment: payment[0]._id },
                { new: true, runValidators: true, session }
            ).populate("user", "name email phone address")
            .populate("tour", "title costFrom")
            .populate("payment");

        // sslCommerz payment
        const userName = (updatedBooking?.user as any).name;
        const userEmail = (updatedBooking?.user as any).email;
        const userPhone = (updatedBooking?.user as any).phone;
        const userAddress = (updatedBooking?.user as any).address;

        const sslPayload: ISSLCommerz = {
            name: userName,
            email: userEmail,
            phoneNumber: userPhone,
            address: userAddress,
            amount: amount,
            transactionId: transactionId
        }

        const sslPayment = await SSLService.sslPaymentInit(sslPayload);

        console.log("ssl payment:", sslPayment);

        await session.commitTransaction(); // transaction
        session.endSession();
        return {
            paymentUrl: sslPayment.GatewayPageURL,
            updatedBooking
        };

    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession();
        throw error;
    }
}

// service function to get all bookings
const getAllBookings = async (query: Record<string, string>) => {
    // get all
    const queryBuilder = new QueryBuilder(Booking.find(), query);

    const bookings = queryBuilder
        .filter()
        .search(bookingSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        bookings.build(),
        queryBuilder.getMeta()
    ]);

    return {
        data,
        meta
    }
}

// service function to get user bookings
const getUserBookings = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, "This user does not exist.")
    }

    const userBookings = await Booking.find({ user: userId });

    return userBookings;
}

// service function to get all single booking
const getSingleBooking = async (bookingId: string) => {
    // get single bookings
    const booking = await Booking.findById(bookingId);

    return booking;
}

// service function to update booking status
const updateBookingStatus = async () => {
    // update
}

export const BookingServices = {
    createBooking,
    getAllBookings,
    getUserBookings,
    getSingleBooking,
    updateBookingStatus,
}