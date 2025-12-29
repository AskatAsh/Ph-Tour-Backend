import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params: {
        public_id: async (req, file) => {
            const filename = file.originalname.toLowerCase()
                .replace(/\s+/g, "-") // replace empty space with -
                .replace(/\./g, "-")
                // eslint-disable-next-line no-useless-escape
                .replace(/[^a-z0-9\-\.]/g, "") // replace non-alpha numeric characters - !@#$

            const extension = file.originalname.split(".").pop();

            const uniqueFilename = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + filename + "." + extension;

            return uniqueFilename
        },
    }
})

export const multerUpload = multer({ storage: storage });