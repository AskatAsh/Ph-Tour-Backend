import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { verifyUser } from "../../middlewares/verifyUser";
import { Role } from "../user/user.interface";
import { AuthControllers } from "./auth.controller";

const router = Router();

router.post('/login', AuthControllers.credentialsLogin);
router.post('/logout', AuthControllers.logout);
router.post('/refresh-token', AuthControllers.getNewAccessToken);
router.post('/reset-password', verifyUser(...Object.values(Role)), AuthControllers.resetPassword);
router.get('/google', async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || '/';
    passport.authenticate("google", { scope: ['profile', 'email'], state: redirect as string })(req, res, next);
});
router.get('/google/callback', passport.authenticate("google", { failureRedirect: '/login' }), AuthControllers.googleCallback);

export const AuthRoutes = router;