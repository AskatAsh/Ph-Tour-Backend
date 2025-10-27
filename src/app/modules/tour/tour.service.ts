import httpStatus from 'http-status-codes';
import AppError from "../../errorHelpers/appError";
import { ITour, ITourType } from "./tour.interface";
import { Tour, TourType } from "./tour.model";

const createTour = async (payload: ITour) => {

    const existTour = await Tour.find({ title: payload.title });
    if (!existTour) {
        throw new AppError(httpStatus.BAD_REQUEST, "A tour with this title already exists.");
    }

    const tour = await Tour.create(payload);

    return tour;
}

const createTourType = async (payload: ITourType) => {
    const existTourType = await Tour.find({ name: payload.name });
    if (!existTourType) {
        throw new AppError(httpStatus.BAD_REQUEST, "A tour type with this name already exists.");
    }

    const tourType = await TourType.create(payload);

    return tourType;
}

export const TourService = {
    createTour,
    createTourType
}