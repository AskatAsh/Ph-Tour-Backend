import bcryptjs from 'bcryptjs';
import httpStatus from 'http-status-codes';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../../config/env';
import AppError from "../../errorHelpers/appError";
import { createNewAccessToken, getAuthTokens } from '../../utils/getAuthTokens';
import { sendMail } from '../../utils/sendEmail';
import { AuthProvider, IAuthProvider, IUser, Status } from "../user/user.interface";
import User from "../user/user.model";

// login user using credentials and generate tokens -> now done by passport
const credentialsLogin = async (payload: Partial<IUser>) => {

    const { email, password } = payload;

    const isUserExist = await User.findOne({ email }).select("+password");

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "This User Does Not Exist.");
    }

    const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string);

    if (!isPasswordMatched) {
        throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password.");
    }

    const { accessToken, refreshToken } = getAuthTokens(isUserExist);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pass, ...rest } = isUserExist.toObject();

    return {
        accessToken,
        refreshToken,
        user: rest
    }
};

// generate access token with refresh token
const getNewAccessToken = async (refreshToken: string) => {
    const accessToken = await createNewAccessToken(refreshToken);

    return {
        accessToken
    }
};

// set new password
const setPassword = async (userId: string, plainPassword: string) => {

    const user = await User.findById(userId).select("+password");

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found.");
    }

    if (user.password && user.auths.some(providerObject => providerObject.provider === "GOOGLE")) {
        throw new AppError(httpStatus.BAD_REQUEST, "You have already set your password. Change it from profile password update.")
    }


    const salt = await bcryptjs.genSalt(envVars.BCRYPT_SALT_ROUND);
    const hashedPassword = await bcryptjs.hash(plainPassword, salt);

    const credentialProvider: IAuthProvider = {
        provider: AuthProvider.CREDENTIAL,
        providerId: user.email
    }

    const auths: IAuthProvider[] = [...user.auths, credentialProvider];

    user.password = hashedPassword;

    user.auths = auths;

    await user.save();
};

// forgot password
const forgotPassword = async (email: string) => {

    const isUserExist = await User.findOne({ email });

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "This User Does Not Exist.");
    }
    if (!isUserExist.isVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, "This User is Not Verified.");
    }
    if (isUserExist.status === Status.BLOCKED || isUserExist.status === Status.INACTIVE) {
        throw new AppError(httpStatus.BAD_REQUEST, `This User is ${isUserExist.status}.`);
    }
    if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "This User Does Not Exist.");
    }

    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    }

    const resetToken = jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {
        expiresIn: '10m'
    })

    const resetPasswordLink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;

    sendMail({
        to: isUserExist.email,
        subject: "Reset Password",
        templateName: 'forgetPassword.ejs',
        templateData: {
            name: isUserExist.name,
            resetPasswordLink
        }
    })
};

// reset old password
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resetPassword = async (payload: Record<string, any>, decodedToken: JwtPayload) => {
    if (payload.id !== decodedToken.userId) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot reset you password.");
    }

    const isUserExist = await User.findById(decodedToken.userId).select("+password");

    if (!isUserExist) {
        throw new AppError(401, "User does not exist")
    }

    const salt = await bcryptjs.genSalt(envVars.BCRYPT_SALT_ROUND);
    const hashedPassword = await bcryptjs.hash(payload.newPassword, salt);

    isUserExist.password = hashedPassword;

    await isUserExist.save();
};

// change password
const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

    const user = await User.findById(decodedToken.userId).select("+password");

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found.");
    }

    const isPasswordMatched = await bcryptjs.compare(oldPassword, user?.password as string);

    if (!isPasswordMatched) {
        throw new AppError(httpStatus.BAD_REQUEST, "Old Password Does Not Match.");
    }

    const salt = await bcryptjs.genSalt(envVars.BCRYPT_SALT_ROUND);

    user.password = await bcryptjs.hash(newPassword, salt);

    await user.save();
};

export const AuthServices = {
    credentialsLogin,
    getNewAccessToken,
    resetPassword,
    setPassword,
    forgotPassword,
    changePassword
}