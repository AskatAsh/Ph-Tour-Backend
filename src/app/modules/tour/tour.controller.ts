/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from 'http-status-codes';
import { sendResponse } from "../../utils/sendResponse";
import { TourService } from "./tour.service";

// tour controllers
// create tour
const createTour = async (req: Request, res: Response, next: NextFunction) => {
    const tour = await TourService.createTour(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Tour Created Successfully!",
        data: tour,
    })
}

// get all tour
const getAllTour = async (req: Request, res: Response, next: NextFunction) => {
    const tours = await TourService.getAllTour();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Tours Retrieved Successfully!",
        data: tours.data,
        meta: tours.meta
    })
}

// tour type controllers
// create tour type
const createTourType = async (req: Request, res: Response, next: NextFunction) => {
    const tourType = await TourService.createTourType(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Tour Type Created Successfully!",
        data: tourType,
    })
}

// get all tour types
const getAllTourType = async (req: Request, res: Response, next: NextFunction) => {
    const tourTypes = await TourService.getAllTourType();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Tour Types Retrieved Successfully!",
        data: tourTypes.data,
        meta: tourTypes.meta
    })
}

export const TourControllers = {
    createTour,
    getAllTour,
    createTourType,
    getAllTourType
}