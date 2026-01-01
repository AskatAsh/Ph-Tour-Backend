import z from "zod";

export const createDivisionZodSchema = z.object({
    name: z.string().min(2),
    thumbnail: z.string().optional(),
    description: z.string().optional()
})