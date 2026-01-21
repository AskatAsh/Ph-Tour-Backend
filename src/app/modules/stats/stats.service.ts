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
    // get tour stats
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