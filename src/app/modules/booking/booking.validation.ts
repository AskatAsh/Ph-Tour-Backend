import z from "zod";
import { BOOKNG_STATUS } from "./booking.interface";

export const createBookingZodSchema = z.object({
    tour: z.string(),
    guestCount: z.number().int().positive(),
});

export const updateBookingStatusZodSchema = z.object({
    status: z.enum(Object.values(BOOKNG_STATUS))
});