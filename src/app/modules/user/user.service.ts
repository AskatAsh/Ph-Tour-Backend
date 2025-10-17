import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { AuthProvider, IAuthProvider, IUser, Role } from "./user.interface";
import User from "./user.model";

// service function to create user
const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "This user already exists.");
    }

    const salt = await bcryptjs.genSalt(envVars.BCRYPT_SALT_ROUND);

    const hashedPassword = await bcryptjs.hash(password as string, salt);

    const authProvider: IAuthProvider = { provider: AuthProvider.CREDENTIAL, providerId: email as string };

    const user = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        ...rest
    });

    return user;
}

// service function to update user
const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
    const isUserExist = await User.findById(userId);

    if (!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "This User Does Not Exist.");
    }

    if (payload.role) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.MANAGER) {
            throw new AppError(httpStatus.FORBIDDEN, "You Are Not Authorized.");
        }

        if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "You Are Not Authorized.");
        }
    } else {
        if (decodedToken.role !== isUserExist.role) {
            throw new AppError(httpStatus.FORBIDDEN, "You Are Not Authorized.");
        }
    }

    if (payload.isVerified || payload.isDeleted || payload.status) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.MANAGER) {
            throw new AppError(httpStatus.FORBIDDEN, "You Are Not Authorized.");
        }
    }

    if (payload.password) {
        const salt = await bcryptjs.genSalt(envVars.BCRYPT_SALT_ROUND);
        payload.password = await bcryptjs.hash(payload.password as string, salt);
    }

    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });

    return newUpdatedUser;
}

// service function to get all users
const getAllUsers = async () => {

    const users = await User.find({});

    const totalUsers = await User.countDocuments();

    return {
        users,
        meta: {
            total: totalUsers
        }
    };
}

export const UserServices = {
    createUser,
    updateUser,
    getAllUsers
}