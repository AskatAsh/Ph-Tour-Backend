import httpStatus from 'http-status-codes';
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/appError";
import { IUser, Status } from "../modules/user/user.interface";
import User from "../modules/user/user.model";
import { generateToken, verifyToken } from "./jwt";

export const getAuthTokens = (user: Partial<IUser>) => {
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
    }

    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);

    const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES);

    return { accessToken, refreshToken };
}

export const createNewAccessToken = async (refreshToken: string) => {
    const verifiedToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload;

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

    const payload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role,
    }

    const accessToken = generateToken(payload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);

    return accessToken;
}