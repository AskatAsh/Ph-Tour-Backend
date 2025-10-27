import { Request, Response } from "express";
import httpStatus from 'http-status-codes';
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TourService } from "./tour.service";

// tour controllers
// create tour
const createTour = catchAsync(async (req: Request, res: Response) => {
    const tour = await TourService.createTour(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Tour Created Successfully!",
        data: tour,
    })
})

// get all tour
const getAllTour = catchAsync(async (req: Request, res: Response) => {
    const tours = await TourService.getAllTour();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Tours Retrieved Successfully!",
        data: tours.data,
        meta: tours.meta
    })
})

// update tour
const updateTour = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await TourService.updateTour(id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Tour Updated Successfully!",
        data: result,
    })
})

// delte tour
const deleteTour = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await TourService.deleteTour(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Tour Deleted Successfully!',
        data: result,
    });
});

// tour type controllers
// create tour type
const createTourType = catchAsync(async (req: Request, res: Response) => {
    const tourType = await TourService.createTourType(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Tour Type Created Successfully!",
        data: tourType,
    })
})

// get all tour types
const getAllTourType = catchAsync(async (req: Request, res: Response) => {
    const tourTypes = await TourService.getAllTourType();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Tour Types Retrieved Successfully!",
        data: tourTypes.data,
        meta: tourTypes.meta
    })
})

// update tour type
const updateTourType = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await TourService.updateTourType(id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Tour Type Updated Successfully!",
        data: result,
    })
})

// delte tour type
const deleteTourType = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await TourService.deleteTourType(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Tour Type Deleted Successfully!',
        data: result,
    });
});

export const TourControllers = {
    createTour,
    getAllTour,
    updateTour,
    deleteTour,
    createTourType,
    getAllTourType,
    updateTourType,
    deleteTourType
}