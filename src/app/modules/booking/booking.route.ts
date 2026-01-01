import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { verifyUser } from "../../middlewares/verifyUser";
import { Role } from "../user/user.interface";
import { BookingControllers } from "./booking.controller";
import { createBookingZodSchema, updateBookingStatusZodSchema } from "./booking.validation";

const router = Router();

// api/v1/booking
router.post('/', verifyUser(...Object.values(Role)), validateRequest(createBookingZodSchema), BookingControllers.createBooking);
// api/v1/booking
router.get('/', verifyUser(Role.ADMIN, Role.SUPER_ADMIN), BookingControllers.getAllBookings);
// api/v1/booking/my-bookings
router.get('/my-bookings', verifyUser(...Object.values(Role)), BookingControllers.getUserBookings);
// api/v1/booking/bookingId
router.get('/:bookingId', verifyUser(...Object.values(Role)), BookingControllers.getSingleBooking);
// api/v1/booking/bookingId/status
router.patch('/bookingId/status', verifyUser(...Object.values(Role)), validateRequest(updateBookingStatusZodSchema), BookingControllers.updateBookingStatus);

export const BookingRoutes = router;