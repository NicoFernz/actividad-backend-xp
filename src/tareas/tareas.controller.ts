import type { RequestHandler } from "express";
import {
    createTareaSchema,
    listTareasQuerySchema,
    patchTareaSchema,
    replaceTareaSchema,
} from "./tarea.js";
import { TareasService } from "./tareas.service.js";

export class TareasController {
    constructor(private readonly service: TareasService) { }

    list: RequestHandler = async (request, response) => {
        const query = listTareasQuerySchema.parse(request.query);
        response.json(await this.service.list(query));
    };

    summary: RequestHandler = async (_request, response) => {
        response.json({ data: await this.service.summary() });
    };

    get: RequestHandler<{ id: string }> = async (request, response) => {
        response.json({ data: await this.service.get(request.params.id) });
    };

    create: RequestHandler = async (request, response) => {
        const body = createTareaSchema.parse(request.body);
        response.status(201).json({ data: await this.service.create(body) });
    };

    replace: RequestHandler<{ id: string }> = async (request, response) => {
        const body = replaceTareaSchema.parse(request.body);
        response.json({ data: await this.service.replace(request.params.id, body) });
    };

    patch: RequestHandler<{ id: string }> = async (request, response) => {
        const body = patchTareaSchema.parse(request.body);
        response.json({ data: await this.service.patch(request.params.id, body) });
    };

    delete: RequestHandler<{ id: string }> = async (request, response) => {
        await this.service.delete(request.params.id);
        response.status(204).end();
    };
}