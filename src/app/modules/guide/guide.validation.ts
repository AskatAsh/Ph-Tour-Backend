import z from "zod";

export const applyAsGuideZodSchema = z.object({
    division: z.string()
})
export const approveGuideZodSchema = z.object({
    status: z.string()
})