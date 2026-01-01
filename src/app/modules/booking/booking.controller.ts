/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from 'http-status-codes';
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BookingServices } from "./booking.service";

// controller to create booking
const createBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const booking = await BookingServices.createBooking(req.body, decodedToken.userId);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Booking Created Successfully",
        data: booking
    })
})

// controller to get all users
const getAllBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const bookings = await BookingServices.getAllBookings(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Bookings Retrieved Successfully!",
        data: bookings.data,
        meta: bookings.meta
    })
})

// controller to get user bookings
const getUserBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const userBookings = await BookingServices.getUserBookings(decodedToken.userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User Bookings Retrieved Successfully",
        data: userBookings
    })
})
// controller to get single booking
const getSingleBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // get single bookings
    const { bookingId } = req.params;

    const booking = await BookingServices.getSingleBooking(bookingId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Booking Retrieved Successfully!",
        data: booking
    })
})

// controller to update booking status
const updateBookingStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // update
})

export const BookingControllers = {
    createBooking,
    getAllBookings,
    getUserBookings,
    getSingleBooking,
    updateBookingStatus,
}