import { ProjectSchema, ProjectUpdateSchema } from "../infrastructure/validators/project.ts";
import { ProjectModel } from "../model/project.ts";

interface ProjectCreateData {
    title: string;
    shortDescription: string;
    description: string;
    technologies: string[];
    status: 'completado' | 'en-progreso' | 'planificado';
    image?: string;
    images?: string[];
    githubUrl?: string | null;
    webUrl?: string | null;
    backendUrl?: string | null;
    apkUrl?: string | null;
}

interface ProjectEditData {
    title?: string;
    shortDescription?: string;
    description?: string;
    technologies?: string[];
    status?: 'completado' | 'en-progreso' | 'planificado';
    image?: string;
    images?: string[];
    githubUrl?: string | null;
    webUrl?: string | null;
    backendUrl?: string | null;
    apkUrl?: string | null;
}

function cleanImageList(list?: string[]): string[] {
    if (!Array.isArray(list)) return [];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of list) {
        const trimmed = typeof item === 'string' ? item.trim() : '';
        if (trimmed && !seen.has(trimmed)) {
            seen.add(trimmed);
            result.push(trimmed);
        }
    }
    return result;
}

function normalizeProjectResponse<T extends { image: string; images?: string[] }>(project: T): T & { images: string[] } {
    const cleaned = cleanImageList(project.images);
    const cover = project.image?.trim() || '';
    const images = cleaned.length > 0 ? cleaned : (cover ? [cover] : []);
    return {
        ...project,
        image: images[0] || cover,
        images,
    };
}

export class ProjectsService {
    static async getProjects() {
        const projects = await ProjectModel.findAll();
        return projects.map((project: any) => normalizeProjectResponse(project));
    }

    static async getProject(id: number) {
        const project = await ProjectModel.findById(id);
        if (!project) {
            throw new Error("Project not found");
        }
        return normalizeProjectResponse(project as any);
    }

    static async createProject(data: ProjectCreateData) {
        const validated = ProjectSchema.parse(data);
        const images = cleanImageList(validated.images);
        const cover = validated.image?.trim() || '';

        const finalImages = images.length > 0 ? images : (cover ? [cover] : []);
        const finalCover = finalImages[0] || cover;

        const created = await ProjectModel.create({
            ...validated,
            image: finalCover,
            images: finalImages,
        });
        return normalizeProjectResponse(created as any);
    }

    static async updateProject(id: number, newData: ProjectEditData) {
        const existing = await ProjectModel.findById(id);
        if (!existing) {
            throw new Error("Project not found");
        }
        const validated = ProjectUpdateSchema.parse(newData);
        const payload: any = { ...validated };

        const hasImagesField = validated.images !== undefined;
        const hasImageField = validated.image !== undefined;

        if (hasImagesField) {
            const cleaned = cleanImageList(validated.images);
            if (cleaned.length > 0) {
                payload.images = cleaned;
                payload.image = cleaned[0];
            } else if (hasImageField && validated.image?.trim()) {
                const single = validated.image.trim();
                payload.images = [single];
                payload.image = single;
            } else {
                throw new Error("At least one project image is required");
            }
        } else if (hasImageField && validated.image?.trim()) {
            const single = validated.image.trim();
            const existingImages = cleanImageList((existing as any).images);
            payload.image = single;
            payload.images = existingImages.length > 1
                ? [single, ...existingImages.filter(img => img !== single)]
                : [single];
        }

        const updated = await ProjectModel.update(id, payload);
        return updated ? normalizeProjectResponse(updated as any) : null;
    }

    static async deleteProject(id: number) {
        const existing = await ProjectModel.findById(id);
        if (!existing) {
            throw new Error("Project not found");
        }
        return ProjectModel.delete(id);
    }
}
