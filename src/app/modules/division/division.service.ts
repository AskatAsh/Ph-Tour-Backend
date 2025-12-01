import httpStatus from 'http-status-codes';
import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from '../../utils/QueryBuilder';
import { divisionSearchableFields } from './division.constant';
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
const getAllDivisions = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(Division.find(), query);

    const divisions = queryBuilder
        .filter()
        .search(divisionSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        divisions.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
}

// get single division
const getSingleDivision = async (slug: string) => {
    const division = await Division.findOne({ slug });

    return {
        data: division
    }
}

// update division
const updateDivision = async (id: string, payload: Partial<IDivision>) => {
    const existingDivision = await Division.findById(id);
    if (!existingDivision) {
        throw new AppError(httpStatus.BAD_REQUEST, "Division Not Found.");
    }

    const duplicateDivision = await Division.findOne({
        name: payload.name,
        _id: { $ne: id }
    })
    if (duplicateDivision) {
        throw new AppError(httpStatus.BAD_REQUEST, "A division with this name already exists.");
    }

    const updateDivision = await Division.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

    return updateDivision;
}

// delete division
const deleteDivision = async (id: string) => {
    await Division.findByIdAndDelete(id);

    return null;
}

export const DivisionService = {
    createDivision,
    getAllDivisions,
    getSingleDivision,
    updateDivision,
    deleteDivision
}