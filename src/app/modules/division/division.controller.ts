import { Request, Response } from "express";
import httpStatus from 'http-status-codes';
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DivisionService } from "./division.service";

// create division
const createDivision = catchAsync(async (req: Request, res: Response) => {

    const division = await DivisionService.createDivision(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Division Created Successfully!",
        data: division,
    })
});

// get all division
const getAllDivisions = catchAsync(async (req: Request, res: Response) => {
    const result = await DivisionService.getAllDivisions();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Divisions Retrieved Successfully!",
        data: result.data,
        meta: result.meta
    });
});

// get single division
const getSingleDivision = catchAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const result = await DivisionService.getSingleDivision(slug);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Division Retrieved Successfully!",
        data: result.data
    });
});

// update division
const updateDivision = catchAsync(async (req: Request, res: Response) => {
    const result = await DivisionService.updateDivision(req.params.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Updated Division Successfully!",
        data: result
    });
});

// delete division
const deleteDivision = catchAsync(async (req: Request, res: Response) => {
    const result = await DivisionService.deleteDivision(req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Division Deleted Successfully!",
        data: result
    });
});

export const DivisionControllers = {
    createDivision,
    getAllDivisions,
    getSingleDivision,
    updateDivision,
    deleteDivision
}