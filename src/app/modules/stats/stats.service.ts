import Booking from "../booking/booking.model";
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
    ])

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
    ])

    const [totalTours, totalTourByTourType, totalTourByDivision, avgTourCost, totalHighestBookedTour] = await Promise.all([
        totalToursPromise,
        totalTourByTourTypePromise,
        totalTourByDivisionPromise,
        avgTourCostPromise,
        totalHighestBookedTourPromise
    ])

    return {
        totalTours,
        totalTourByTourType,
        totalTourByDivision,
        avgTourCost,
        totalHighestBookedTour
    }
}

const getBookingStats = async () => {
    // get booking stats
}

const getPaymentStats = async () => {
    // get payment stats
}

export const StatsService = {
    getBookingStats,
    getPaymentStats,
    getTourStats,
    getUserStats
}