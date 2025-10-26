/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from 'http-status-codes';
import { sendResponse } from "../../utils/sendResponse";
import { DivisionService } from "./division.service";

// create division
const createDivision = async (req: Request, res: Response, next: NextFunction) => {

    const division = await DivisionService.createDivision(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Division Created Successfully!",
        data: division,
    })
}

// get all division
const getAllDivisions = async (req: Request, res: Response, next: NextFunction) => {
    const result = await DivisionService.getAllDivisions();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Divisions Retrieved Successfully!",
        data: result.data,
        meta: result.meta
    });
}

// get single division
const getSingleDivision = async (req: Request, res: Response, next: NextFunction) => {
    const result = await DivisionService.getSingleDivision(req.params.slug);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Division Retrieved Successfully!",
        data: result.data
    });
}

// update division
const updateDivision = async (req: Request, res: Response, next: NextFunction) => {
    const result = await DivisionService.updateDivision(req.params.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Updated Division Successfully!",
        data: result
    });
}

// delete division
const deleteDivision = async (req: Request, res: Response, next: NextFunction) => {
    const result = await DivisionService.deleteDivision(req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Division Deleted Successfully!",
        data: result
    });
}

export const DivisionControllers = {
    createDivision,
    getAllDivisions,
    getSingleDivision,
    updateDivision,
    deleteDivision
}