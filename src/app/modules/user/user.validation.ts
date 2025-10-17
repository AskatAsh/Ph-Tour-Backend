import z from "zod";
import { Role, Status } from "./user.interface";

export const createUserZodSchema = z.object({
    name: z
        .string()
        .min(2, { error: "Name must be at least 2 characters long." })
        .max(50, { error: "Name cannot be more that 50 characters." })
        .regex(/^[A-Za-z\s]+$/, "Name must contain only letters and spaces."),
    email: z
        .email("Invalid email address.")
        .min(5, { error: "Email must be at least 5 characters long." })
        .max(100, { error: "Name cannot be more that 100 characters." }),
    password: z
        .string()
        .min(8, { error: "Password must be at least 8 characters long." })
        .regex(/^(?=.*[A-Z]).+$/, { error: "Password must have at least 1 uppercase letter." })
        .regex(/^(?=.*\d).+$/, { error: "Password must have at least 1 number." })
        .regex(/^(?=.*[^A-Za-z0-9]).+$/, { error: "Password must have at least 1 specail character." }),
    phone: z
        .string()
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, { error: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX" })
        .optional(),
    address: z
        .string()
        .max(200, { error: "Address cannot be more that 200 characters." })
        .optional(),
})

export const updateUserZodSchema = z.object({
    name: z
        .string()
        .min(2, { error: "Name must be at least 2 characters long." })
        .max(50, { error: "Name cannot be more that 50 characters." })
        .regex(/^[A-Za-z\s]+$/, "Name must contain only letters and spaces.")
        .optional(),
    password: z
        .string()
        .min(8, { error: "Password must be at least 8 characters long." })
        .regex(/^(?=.*[A-Z]).+$/, { error: "Password must have at least 1 uppercase letter." })
        .regex(/^(?=.*\d).+$/, { error: "Password must have at least 1 number." })
        .regex(/^(?=.*[^A-Za-z0-9]).+$/, { error: "Password must have at least 1 specail character." })
        .optional(),
    phone: z
        .string()
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, { error: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX" })
        .optional(),
    address: z
        .string()
        .max(200, { error: "Address cannot be more that 200 characters." })
        .optional(),
    status: z
        .enum(Object.values(Status))
        .optional(),
    isVerified: z
        .boolean("isVerified must be true or false.")
        .optional(),
    role: z
        .enum(Object.values(Role))
        .optional(),
    isDeleted: z
        .boolean("isDeleted must be true or false.")
        .optional(),
})