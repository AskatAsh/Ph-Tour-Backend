/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { GuideApplicationStatus, IGuideApplication } from './guide.interface';
import { GuideServices } from './guide.service';

const applyAsGuide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const payload: IGuideApplication = {
        ...req.body,
        user: decodedToken.userId,
        nidPhoto: req.file?.path,
        status: GuideApplicationStatus.PENDING
    };

    const result = await GuideServices.applyAsGuide(payload, decodedToken.userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Applied as a Guide Successfully",
        data: result
    });
});

const approveGuideApplication = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;
    const id = req.params.id;

    console.log("status and id:", status, id);

    const updatedApplication = await GuideServices.approveGuideApplication(status, id);

    console.log("updated application:", updatedApplication);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Guide Application Updated Successfully",
        data: updatedApplication
    });
});

const getGuides = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Guides Retrieved Successfully",
        data: null
    });
});

const getSingleGuide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Guide Retrieved Successfully",
        data: null
    });
});

export const GuideControllers = {
    applyAsGuide,
    approveGuideApplication,
    getGuides,
    getSingleGuide
}