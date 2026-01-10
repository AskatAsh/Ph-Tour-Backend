import crypto from "crypto";
import httpStatus from "http-status-codes";
import { redisClient } from "../../config/redis.config";
import AppError from "../../errorHelpers/appError";
import { sendMail } from "../../utils/sendEmail";
import User from "../user/user.model";

// otp expiration time (in seconds)
const OTP_EXPIRATION = 2 * 60 // 2minute

const generateOtp = (length = 6) => {
    const min = 10 ** (length - 1);
    const max = 10 ** length;

    const otp = crypto.randomInt(min, max).toString();

    return otp;
}

const sendOTP = async (email: string, name: string) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    if (user.isVerified) {
        throw new AppError(httpStatus.NOT_FOUND, "You are already verified")
    }

    const otp = generateOtp();

    const redisKey = `otp:${email}`;

    await redisClient.set(redisKey, otp, {
        expiration: {
            type: "EX",
            value: OTP_EXPIRATION
        }
    })

    await sendMail({
        to: email,
        subject: "Your OTP Code",
        templateName: "otp",
        templateData: {
            name: name,
            otp: otp
        }
    })
};

const verifyOTP = async (email: string, otp: string) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    if (user.isVerified) {
        throw new AppError(httpStatus.NOT_FOUND, "You are already verified")
    }

    const redisKey = `otp:${email}`;

    const savedOtp = await redisClient.get(redisKey);

    if (!savedOtp) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid OTP");
    }

    if (savedOtp !== otp) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid OTP");
    }

    await Promise.all([
        User.updateOne({ email }, { isVerified: true }, { runValidators: true }),
        redisClient.del([redisKey])
    ])
};

export const OTPService = {
    sendOTP,
    verifyOTP
}