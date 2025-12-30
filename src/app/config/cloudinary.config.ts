import { v2 as cloudinary } from 'cloudinary';
import httpStatus from "http-status-codes";
import AppError from '../errorHelpers/appError';
import { envVars } from './env';

cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET
});

export const deleteImageFromCloudinary = async (url: string) => {
    try {
        const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;

        const match = url.match(regex);

        if (match && match[1]) {
            const public_id = match[1];
            await cloudinary.uploader.destroy(public_id);

            console.log(`File ${public_id} is deleted from cloudinary.`);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        throw new AppError(httpStatus.CONFLICT, "Cloudinary Image Deletion Failed", error.message);
    }
}

export const cloudinaryUpload = cloudinary;