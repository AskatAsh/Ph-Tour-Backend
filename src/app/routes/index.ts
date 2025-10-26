import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { DivisionRoutes } from "../modules/division/division.route";
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
    }
]

// used Router().use() express middleware for routing
moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})