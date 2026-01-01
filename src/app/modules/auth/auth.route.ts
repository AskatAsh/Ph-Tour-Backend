import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { envVars } from "../../config/env";
import { verifyUser } from "../../middlewares/verifyUser";
import { Role } from "../user/user.interface";
import { AuthControllers } from "./auth.controller";

const router = Router();

router.post('/login', AuthControllers.credentialsLogin);
router.post('/logout', AuthControllers.logout);
router.post('/refresh-token', AuthControllers.getNewAccessToken);
router.post('/reset-password', verifyUser(...Object.values(Role)), AuthControllers.resetPassword);
router.post('/set-password', verifyUser(...Object.values(Role)), AuthControllers.setPassword);
router.post('/forgot-password', AuthControllers.forgotPassword);
router.post('/change-password', verifyUser(...Object.values(Role)), AuthControllers.changePassword);
router.get('/google', async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || '/';
    passport.authenticate("google", { scope: ['profile', 'email'], state: redirect as string })(req, res, next);
});
router.get('/google/callback', passport.authenticate("google", { failureRedirect: `${envVars.FRONTEND_URL}/login?error=There is some issues in your account. Please contact our support team.` }), AuthControllers.googleCallback);

export const AuthRoutes = router;