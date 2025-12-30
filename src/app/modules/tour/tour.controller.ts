import { Request, Response } from "express";
import httpStatus from 'http-status-codes';
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ITour } from "./tour.interface";
import { TourService } from "./tour.service";

// tour controllers
// create tour
const createTour = catchAsync(async (req: Request, res: Response) => {

    const payload: ITour = {
        ...req.body,
        images: (req.files as Express.Multer.File[]).map((file) => file.path)
    }
    const tour = await TourService.createTour(payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Tour Created Successfully!",
        data: tour
    })
})

// get all tour
const getAllTour = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;

    const tours = await TourService.getAllTour(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Tours Retrieved Successfully!",
        data: tours.data,
        meta: tours.meta
    })
})


// get single tour
const getSingleTour = catchAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const result = await TourService.getSingleTour(slug);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Tour Retrieved Successfully!",
        data: result
    })
});

// update tour
const updateTour = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;

    const payload: ITour = {
        ...req.body,
        images: (req.files as Express.Multer.File[]).map((file) => file.path)
    }

    const result = await TourService.updateTour(id, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Tour Updated Successfully!",
        data: result,
    })
})

// delete tour
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
    const query = req.query;
    const tourTypes = await TourService.getAllTourType(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Tour Types Retrieved Successfully!",
        data: tourTypes.data,
        meta: tourTypes.meta
    })
})

// get single tour type
const getSingleTourType = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await TourService.getSingleTourType(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Tour Type Retrieved Successfully!",
        data: result
    })
});

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

// delete tour type
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
    getSingleTour,
    updateTour,
    deleteTour,
    createTourType,
    getAllTourType,
    getSingleTourType,
    updateTourType,
    deleteTourType
}