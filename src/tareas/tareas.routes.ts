import { Router } from "express";
import { TareasController } from "./tareas.controller.js";
import type { TareasRepository } from "./tareas.repository.js";
import { TareasService } from "./tareas.service.js";

export function createTareasRouter(repository: TareasRepository): Router {
    const router = Router();
    const controller = new TareasController(new TareasService(repository));

    router.get("/", controller.list);
    router.post("/", controller.create);
    router.get("/resumen", controller.summary);
    router.get("/:id", controller.get);
    router.put("/:id", controller.replace);
    router.patch("/:id", controller.patch);
    router.delete("/:id", controller.delete);
    return router;
}