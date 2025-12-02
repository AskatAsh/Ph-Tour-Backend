import { model, Schema } from "mongoose";
import { BOOKNG_STATUS, IBooking } from "./booking.interface";

const bookingSchema = new Schema<IBooking>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        tour: {
            type: Schema.Types.ObjectId,
            ref: "Tour",
            required: true
        },
        payment: {
            type: Schema.Types.ObjectId,
            ref: "Payment",
        },
        guestCount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: Object.values(BOOKNG_STATUS),
            default: BOOKNG_STATUS.PENDING
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

const Booking = model<IBooking>("Booking", bookingSchema);

export default Booking;