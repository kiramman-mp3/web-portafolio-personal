import { z } from "zod";

const ProjectBaseSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
    shortDescription: z.string().min(1, "Short description is required").max(255),
    description: z.string().min(1, "Description is required"),
    technologies: z.array(z.string().min(1).max(255)),
    status: z.enum(['completado', 'en-progreso', 'planificado']),
    image: z.string().min(1).optional(),
    images: z.array(z.string().min(1)).optional(),
    githubUrl: z.string().max(255).nullish().or(z.literal('')),
    webUrl: z.string().max(255).nullish().or(z.literal('')),
    backendUrl: z.string().max(255).nullish().or(z.literal('')),
    apkUrl: z.string().max(255).nullish().or(z.literal('')),
});

export const ProjectSchema = ProjectBaseSchema.refine(
    (data) => Boolean((data.images && data.images.length > 0) || (data.image && data.image.trim().length > 0)),
    { message: "At least one project image is required", path: ["images"] }
);

export const ProjectUpdateSchema = ProjectBaseSchema.partial();
