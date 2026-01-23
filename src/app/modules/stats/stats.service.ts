import Booking from "../booking/booking.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import Payment from "../payment/payment.model";
import { Tour } from "../tour/tour.model";
import { Status } from "../user/user.interface";
import User from "../user/user.model";

const now = new Date();
const sevenDaysAgo = new Date(now)
sevenDaysAgo.setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now)
thirtyDaysAgo.setDate(now.getDate() - 30);

// console.log("now, 7 days ago, 30 days ago:", now, sevenDaysAgo, thirtyDaysAgo);

const getUserStats = async () => {
    const totalUsersPromise = User.countDocuments();

    const totalActiveUsersPromise = User.countDocuments({ status: Status.ACTIVE });
    const totalInactiveUsersPromise = User.countDocuments({ status: Status.INACTIVE });
    const totalBlockedUsersPromise = User.countDocuments({ status: Status.BLOCKED });

    const newUsersInLast7DaysPromise = User.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    });
    const newUsersInLast30DaysPromise = User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    });

    const usersByRolePromise = User.aggregate([
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 }
            }
        }
    ])

    const [totalUsers, activeUsers, inactiveUsers, blockedUsers, newUsersInLast7Days, newUsersInLast30Days, usersByRole] = await Promise.all([
        totalUsersPromise,
        totalActiveUsersPromise,
        totalInactiveUsersPromise,
        totalBlockedUsersPromise,
        newUsersInLast7DaysPromise,
        newUsersInLast30DaysPromise,
        usersByRolePromise
    ])

    return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        blockedUsers,
        newUsersInLast7Days,
        newUsersInLast30Days,
        usersByRole
    }
}

const getTourStats = async () => {
    const totalToursPromise = Tour.countDocuments();

    const totalTourByTourTypePromise = Tour.aggregate([
        {
            $lookup: {
                from: "tourtypes",
                localField: "tourType",
                foreignField: "_id",
                as: "type"
            }
        },
        {
            $unwind: "$type"
        },
        {
            $group: { _id: "$type.name", count: { $sum: 1 } }
        }
    ]);

    const totalTourByDivisionPromise = Tour.aggregate([
        {
            $lookup: {
                from: "divisions",
                localField: "division",
                foreignField: "_id",
                as: "division"
            }
        },
        {
            $unwind: "$division"
        },
        {
            $group: { _id: "$division.name", count: { $sum: 1 } }
        }
    ]);

    const avgTourCostPromise = Tour.aggregate([
        {
            $group: {
                _id: null,
                "avgCostFrom": {
                    $avg: "$costFrom"
                }
            }
        }
    ]);

    const totalHighestBookedTourPromise = Booking.aggregate([
        // stage-1: number of times a tour is booked or number or bookings for each tour
        {
            $group: {
                _id: "$tour",
                "bookingCount": {
                    $sum: 1
                }
            }
        },
        // stage-2: sort the grouped result in desc order
        {
            $sort: {
                "bookingCount": -1
            }
        },
        // stage-3: limit to only get 5 grouped data
        {
            $limit: 5
        },
        // stage-4: using pipeline to connect tour to get tour info
        {
            $lookup: {
                from: "tours",
                let: { "tourId": "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$tourId"]
                            }
                        }

                    }
                ],
                as: "tour"
            }
        },
        // stage-5: unwind 
        {
            $unwind: "$tour"
        },
        // stage-6: project fields to show
        {
            $project: {
                "bookingCount": 1,
                "tour.title": 1,
                "tour.slug": 1
            }
        }
    ]);

    const [totalTours, totalTourByTourType, totalTourByDivision, avgTourCost, totalHighestBookedTour] = await Promise.all([
        totalToursPromise,
        totalTourByTourTypePromise,
        totalTourByDivisionPromise,
        avgTourCostPromise,
        totalHighestBookedTourPromise
    ]);

    return {
        totalTours,
        totalTourByTourType,
        totalTourByDivision,
        avgTourCost,
        totalHighestBookedTour
    };
}

const getBookingStats = async () => {
    const totalBookingPromise = Booking.countDocuments();

    const totalBookingByStatusPromise = Booking.aggregate([
        {
            $group: {
                _id: "$status",
                count: {
                    $sum: 1
                }
            }
        }
    ]);

    const bookingsPerTourPromise = Booking.aggregate([
        {
            $group: {
                _id: "$tour",
                bookingCount: {
                    $sum: 1
                }
            }
        },
        {
            $sort: {
                bookingCount: -1
            }
        },
        {
            $limit: 10
        },
        {
            $lookup: {
                from: "tours",
                localField: "_id",
                foreignField: "_id",
                as: "tour"
            }
        },
        {
            $unwind: "$tour"
        },
        {
            $project: {
                bookingCount: 1,
                "tour.title": 1,
                "tour.slug": 1
            }
        }
    ]);

    const avgGuestCountPerBookingPromise = Booking.aggregate([
        {
            $group: {
                _id: null,
                avgGuestCount: {
                    $avg: "$guestCount"
                }
            }
        }
    ]);

    const bookingsLast7DaysPromise = Booking.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    })
    const bookingsLast30DaysPromise = Booking.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    })

    const totalBookingByUniqueUsersPromise = Booking.distinct("user").then((user) => user.length);

    const [totalBooking, totalBookingByStatus, bookingsPerTour, avgGuestCountPerBooking, bookingsLast7Days, bookingsLast30Days, totalBookingByUniqueUsers] = await Promise.all([
        totalBookingPromise,
        totalBookingByStatusPromise,
        bookingsPerTourPromise,
        avgGuestCountPerBookingPromise,
        bookingsLast7DaysPromise,
        bookingsLast30DaysPromise,
        totalBookingByUniqueUsersPromise
    ]);

    return {
        totalBooking,
        totalBookingByStatus,
        bookingsPerTour,
        avgGuestCountPerBooking,
        bookingsLast7Days,
        bookingsLast30Days,
        totalBookingByUniqueUsers
    };
}

const getPaymentStats = async () => {
    const totalPaymentsPromise = Payment.countDocuments();

    const totalPaymentByStatusPromise = Payment.aggregate([
        {
            $group: { _id: "$status", count: { $sum: 1 } }
        }
    ]);

    const totalRevenuePromise = Payment.aggregate([
        {
            $match: { status: PAYMENT_STATUS.PAID }
        },
        {
            $group: { _id: null, totalRevenue: { $sum: "$amount" } }
        }
    ]);

    const avgPaymentAmountPromise = Payment.aggregate([
        {
            $group: { _id: null, avgPaymentAmount: { $avg: "$amount" } }
        }
    ]);

    const paymentGatewayDataPromise = Payment.aggregate([
        {
            $group: {
                _id: { $ifNull: ["$paymentGatewayData.status", "UNKNOWN"] },
                count: { $sum: 1 }
            }
        }
    ])

    const [totalPayments, totalPaymentByStatus, totalRevenue, avgPaymentAmount, paymentGatewayData] = await Promise.all([
        totalPaymentsPromise,
        totalPaymentByStatusPromise,
        totalRevenuePromise,
        avgPaymentAmountPromise,
        paymentGatewayDataPromise
    ]);

    return {
        totalPayments,
        totalPaymentByStatus,
        totalRevenue,
        avgPaymentAmount,
        paymentGatewayData
    }
}

export const StatsService = {
    getBookingStats,
    getPaymentStats,
    getTourStats,
    getUserStats
}