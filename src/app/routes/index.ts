import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { BookingRoutes } from "../modules/booking/booking.route";
import { DivisionRoutes } from "../modules/division/division.route";
import { GuideRoutes } from "../modules/guide/guide.route";
import { OtpRoutes } from "../modules/otp/otp.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { StatsRoutes } from "../modules/stats/stats.route";
import { TourRoutes } from "../modules/tour/tour.routes";
import { UserRoutes } from "../modules/user/user.route";

export const router = Router();

// array of routing objects with path and route
const moduleRoutes = [
    {
        path: '/user',
        route: UserRoutes
    },
    {
        path: '/auth',
        route: AuthRoutes
    },
    {
        path: '/division',
        route: DivisionRoutes
    },
    {
        path: '/tour',
        route: TourRoutes
    },
    {
        path: '/booking',
        route: BookingRoutes
    },
    {
        path: '/payment',
        route: PaymentRoutes
    },
    {
        path: '/otp',
        route: OtpRoutes
    },
    {
        path: '/stats',
        route: StatsRoutes
    },
    {
        path: '/guide',
        route: GuideRoutes
    }
]

// used Router().use() express middleware for routing
moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})