import express, { type Express } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./docs/openapi.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFound } from "./middlewares/not-found.js";
import { createTareasRouter } from "./tareas/tareas.routes.js";
import {
  InMemoryTareasRepository,
  type TareasRepository,
} from "./tareas/tareas.repository.js";

export interface AppDependencies {
  tareasRepository?: TareasRepository;
}

export function createApp(dependencies: AppDependencies = {}): Express {
  const app = express();
  const repository = dependencies.tareasRepository ?? new InMemoryTareasRepository();

  app.use(express.json());
  app.get("/api/v1", (_request, response) => response.json({
    name: "API de tareas",
    version: "1.0.0",
    links: {
      tareas: "/api/v1/tareas",
      openapi: "/api/v1/openapi.json",
      docs: "/docs",
    },
  }));
  app.get("/api/v1/openapi.json", (_request, response) => response.json(openApiDocument));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use("/api/v1/tareas", createTareasRouter(repository));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}