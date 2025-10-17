import { NextFunction, Request, Response } from "express";
import httpStatus from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from "../config/env";
import AppError from "../errorHelpers/appError";
import { Role, Status } from "../modules/user/user.interface";
import User from "../modules/user/user.model";
import { verifyToken } from "../utils/jwt";

export const verifyUser = (...userRoles: (keyof typeof Role)[]) => async (req: Request, res: Response, next: NextFunction) => {

    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            throw new AppError(403, "Missing Access Token.");
        }

        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload;

        const isUserExist = await User.findOne({ email: verifiedToken.email });

        if (!isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "This User Does Not Exist.");
        }
        if (isUserExist.status === Status.BLOCKED || isUserExist.status === Status.INACTIVE) {
            throw new AppError(httpStatus.BAD_REQUEST, `This User is ${isUserExist.status}.`);
        }
        if (isUserExist.isDeleted) {
            throw new AppError(httpStatus.BAD_REQUEST, "This User Does Not Exist.");
        }

        if (!userRoles.includes(verifiedToken.role)) {
            throw new AppError(403, "You Are Not Permitted To Access This Route.");
        }

        req.user = verifiedToken;

        next();
    } catch (error) {
        next(error);
    }
}