import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";
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

    if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
        if (userId !== decodedToken.userId) {
            throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized");
        }
    }

    const isUserExist = await User.findById(userId);

    if (!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "This User Does Not Exist");
    }

    if (decodedToken.role === Role.ADMIN && isUserExist.role === Role.SUPER_ADMIN) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized")
    }

    if (payload.role) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
            throw new AppError(httpStatus.FORBIDDEN, "You Are Not Authorized.");
        }
    } else {
        if (decodedToken.role !== isUserExist.role) {
            throw new AppError(httpStatus.FORBIDDEN, "You Are Not Authorized.");
        }
    }

    if (payload.isVerified || payload.isDeleted || payload.status) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
            throw new AppError(httpStatus.FORBIDDEN, "You Are Not Authorized.");
        }
    }

    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });

    if (payload.profilePhoto && isUserExist.profilePhoto) {
        await deleteImageFromCloudinary(isUserExist.profilePhoto);
    }

    return newUpdatedUser;
}

// service function to get single user
const getSingleUser = async (id: string) => {
    const user = await User.findById(id);
    return {
        data: user
    }
};

// service function to get all users
const getAllUsers = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(User.find(), query);

    const users = queryBuilder
        .filter()
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        users.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    };
}

// service function to get user info
const getMe = async (userId: string) => {
    const user = await User.findById(userId);

    return {
        data: user
    };
}

export const UserServices = {
    createUser,
    updateUser,
    getAllUsers,
    getSingleUser,
    getMe
}