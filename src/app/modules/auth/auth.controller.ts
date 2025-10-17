/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from 'http-status-codes';
import { JwtPayload } from "jsonwebtoken";
import passport from "passport";
import { IVerifyOptions } from "passport-local";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { catchAsync } from "../../utils/catchAsync";
import { getAuthTokens } from "../../utils/getAuthTokens";
import { sendResponse } from "../../utils/sendResponse";
import { setAuthCookie } from "../../utils/setAuthCookie";
import { AuthServices } from "./auth.service";

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    // uses passport authenticate function to get login info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.authenticate("local", async (error: any, user?: any, options?: IVerifyOptions) => {
        if (error) {
            return next(new AppError(httpStatus.BAD_REQUEST, error))
        }
        if (!user) {
            return next(new AppError(httpStatus.NOT_FOUND, options?.message as string));
        }

        const authTokens = getAuthTokens(user);

        const { password: pass, ...rest } = user.toObject();

        setAuthCookie(res, authTokens);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "User Logged In Successfully!",
            data: {
                accessToken: authTokens.accessToken,
                refreshToken: authTokens.refreshToken,
                user: rest
            },
        })

    })(req, res, next);

    // uses auth service function to get login info
    // const loginInfo = await AuthServices.credentialsLogin(req.body);
})

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No Refresh Token Recieved From Cookies.");
    }

    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken);

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Got New Access Token Successfully!",
        data: tokenInfo,
    })
})

const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged Out Successfully!",
        data: null,
    })
})

const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;
    const { oldPassword, newPassword } = req.body;

    await AuthServices.resetPassword(oldPassword, newPassword, decodedToken as JwtPayload);


    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password Changed Successfully!",
        data: null,
    })
})

const googleCallback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    let redirectTo = req.query.state ? req.query.state as string : ""

    if (redirectTo.startsWith('/')) {
        redirectTo = redirectTo.slice(1);
    }

    const user = req.user;

    console.log(user);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found.");
    }

    const tokenInfo = getAuthTokens(user);

    setAuthCookie(res, tokenInfo);

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
})

export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    resetPassword,
    googleCallback
}