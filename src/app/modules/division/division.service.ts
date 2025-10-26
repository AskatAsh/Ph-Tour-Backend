import httpStatus from 'http-status-codes';
import AppError from "../../errorHelpers/appError";
import { IDivision } from "./division.interface";
import Division from "./division.model";

const createDivision = async (payload: IDivision) => {
    // find if division exists
    const existingDivision = await Division.find({ name: payload.name });
    if (existingDivision) {
        throw new AppError(httpStatus.BAD_REQUEST, "A division with this name already exists.");
    }

    const division = await Division.create(payload);

    return division;
}

export const DivisionService = {
    createDivision
}