import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import { cloudinaryUpload } from "./cloudinary.config";

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params: {
        public_id: async (req, file) => {
            const filenameWithoutExtension = path.parse(file.originalname).name;
            const filename = filenameWithoutExtension.toLowerCase()
                .replace(/\s+/g, "-") // replace empty space with -
                .replace(/\./g, "-")
                // eslint-disable-next-line no-useless-escape
                .replace(/[^a-z0-9\-\.]/g, "") // replace non-alpha numeric characters - !@#$

            const uniqueFilename = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + filename;

            return uniqueFilename
        },
    }
})

export const multerUpload = multer({ storage: storage });