import { BOOKING_STATUS } from "../booking/booking.interface";
import Booking from "../booking/booking.model";
import { PAYMENT_STATUS } from "./payment.interface";
import Payment from "./payment.model";

const successPayment = async (query: Record<string, string>) => {
    // start DB transaction
    const session = await Booking.startSession();
    session.startTransaction();

    try {
        // updated payment status
        const updatePayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.PAID
        }, { new: true, runValidators: true, session: session })

        // update booking status
        await Booking
            .findByIdAndUpdate(
                updatePayment?.booking,
                { status: BOOKING_STATUS.COMPLETE },
                { runValidators: true, session }
            );

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

const failPayment = async () => {

};

const cancelPayment = async () => {

};

export const PaymentService = {
    successPayment,
    failPayment,
    cancelPayment
}