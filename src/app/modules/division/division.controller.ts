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
        message: "Division Retrieved Successfully!",
        data: result.data,
        meta: result.meta
    });
}

export const DivisionControllers = {
    createDivision,
    getAllDivisions
}