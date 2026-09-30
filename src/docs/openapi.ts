const errorResponse = {
  type: "object",
  properties: {
    error: {
      type: "object",
      properties: {
        code: { type: "string" },
        message: { type: "string" },
        details: { type: "array", items: { type: "object" } },
      },
      required: ["code", "message"],
    },
  },
};

const tarea = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string", maxLength: 120 },
    description: { type: "string", maxLength: 1000 },
    completed: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: ["id", "title", "description", "completed", "createdAt", "updatedAt"],
};

const tareaInput = {
  type: "object",
  properties: {
    title: { type: "string", minLength: 1, maxLength: 120 },
    description: { type: "string", maxLength: 1000 },
    completed: { type: "boolean" },
  },
  required: ["title"],
  additionalProperties: false,
};

const dataResponse = {
  type: "object",
  properties: { data: tarea },
  required: ["data"],
};

const listResponse = {
  type: "object",
  properties: {
    data: { type: "array", items: tarea },
    pagination: {
      type: "object",
      properties: {
        page: { type: "integer" },
        limit: { type: "integer" },
        total: { type: "integer" },
        totalPages: { type: "integer" },
      },
      required: ["page", "limit", "total", "totalPages"],
    },
  },
  required: ["data", "pagination"],
};

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "API de tareas",
    version: "1.0.0",
    description: "CRUD de tareas con persistencia temporal en memoria.",
  },
  servers: [{ url: "/api/v1" }],
  paths: {
    "/tareas": {
      get: {
        summary: "Lista tareas con filtros y paginación",
        parameters: [
          { in: "query", name: "q", schema: { type: "string" } },
          { in: "query", name: "completed", schema: { type: "boolean" } },
          { in: "query", name: "sortBy", schema: { type: "string", enum: ["createdAt", "updatedAt", "title"], default: "createdAt" } },
          { in: "query", name: "order", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
          { in: "query", name: "page", schema: { type: "integer", minimum: 1, default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: {
          "200": { description: "Página de tareas", content: { "application/json": { schema: listResponse } } },
          "400": { description: "Parámetros inválidos", content: { "application/json": { schema: errorResponse } } },
        },
      },
      post: {
        summary: "Crea una tarea",
        requestBody: { required: true, content: { "application/json": { schema: { ...tareaInput, required: ["title"] } } } },
        responses: {
          "201": { description: "Tarea creada", content: { "application/json": { schema: dataResponse } } },
          "400": { description: "Cuerpo inválido", content: { "application/json": { schema: errorResponse } } },
        },
      },
    },
    "/tareas/{id}": {
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
      get: {
        summary: "Consulta una tarea",
        responses: {
          "200": { description: "Tarea encontrada", content: { "application/json": { schema: dataResponse } } },
          "404": { description: "Tarea no encontrada", content: { "application/json": { schema: errorResponse } } },
        },
      },
      put: {
        summary: "Reemplaza una tarea",
        requestBody: { required: true, content: { "application/json": { schema: { ...tareaInput, required: ["title", "completed"] } } } },
        responses: {
          "200": { description: "Tarea reemplazada", content: { "application/json": { schema: dataResponse } } },
          "400": { description: "Cuerpo inválido", content: { "application/json": { schema: errorResponse } } },
          "404": { description: "Tarea no encontrada", content: { "application/json": { schema: errorResponse } } },
        },
      },
      patch: {
        summary: "Actualiza parcialmente una tarea",
        requestBody: { required: true, content: { "application/json": { schema: { ...tareaInput, required: [], minProperties: 1 } } } },
        responses: {
          "200": { description: "Tarea actualizada", content: { "application/json": { schema: dataResponse } } },
          "400": { description: "Cuerpo inválido", content: { "application/json": { schema: errorResponse } } },
          "404": { description: "Tarea no encontrada", content: { "application/json": { schema: errorResponse } } },
        },
      },
      delete: {
        summary: "Elimina una tarea",
        responses: {
          "204": { description: "Tarea eliminada" },
          "404": { description: "Tarea no encontrada", content: { "application/json": { schema: errorResponse } } },
        },
      },
    },
  },
};