import httpStatus from 'http-status-codes';
import AppError from "../../errorHelpers/appError";
import { IDivision } from "./division.interface";
import Division from "./division.model";

// create division
const createDivision = async (payload: IDivision) => {
    // find if division exists
    const existingDivision = await Division.find({ name: payload.name });
    if (!existingDivision) {
        throw new AppError(httpStatus.BAD_REQUEST, "A division with this name already exists.");
    }

    const division = await Division.create(payload);

    return division;
}

// get all division
const getAllDivisions = async () => {
    const divisions = await Division.find({});
    const totalDivisions = await Division.countDocuments();

    return {
        data: divisions,
        meta: {
            total: totalDivisions
        }
    }
}

// get single division
const getSingleDivision = async (slug: string) => {
    const division = await Division.findOne({ _id: slug });

    return {
        data: division
    }
}

export const DivisionService = {
    createDivision,
    getAllDivisions,
    getSingleDivision
}