/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from 'http-status-codes';
import { sendResponse } from "../../utils/sendResponse";
import { TourService } from "./tour.service";

const createTour = async (req: Request, res: Response, next: NextFunction) => {
    const tour = await TourService.createTour(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Tour Created Successfully!",
        data: tour,
    })
}

const createTourType = async (req: Request, res: Response, next: NextFunction) => {
    const tourType = await TourService.createTourType(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Tour Type Created Successfully!",
        data: tourType,
    })
}

export const TourControllers = {
    createTour,
    createTourType
}