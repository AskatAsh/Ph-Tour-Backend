
import express from 'express';
import { verifyUser } from '../../middlewares/verifyUser';
import { Role } from '../user/user.interface';
import { StatsController } from './stats.controller';

const router = express.Router();

router.get(
    "/booking",
    verifyUser(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getBookingStats
);
router.get(
    "/payment",
    verifyUser(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getPaymentStats
);
router.get(
    "/user",
    verifyUser(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getUserStats
);
router.get(
    "/tour",
    verifyUser(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getTourStats
);

export const StatsRoutes = router;