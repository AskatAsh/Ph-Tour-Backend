/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserServices } from "./user.service";

// controller to create user
const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Created Successfully!",
        data: user,
    })
})

// controller to update user
const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const payload = req.body;
    const verifiedToken = req.user;

    const updatedUser = await UserServices.updateUser(userId, payload, verifiedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Updated Successfully!",
        data: updatedUser,
    })
})

// controller to get all users
const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getAllUsers();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All Users Retrieved Successfully!",
        data: result.users,
        meta: result.meta
    })
})

export const UserControllers = {
    createUser,
    updateUser,
    getAllUsers
}