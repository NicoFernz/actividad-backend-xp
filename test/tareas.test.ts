import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";
import { InMemoryTareasRepository } from "../src/tareas/tareas.repository.js";

const app = createApp();

describe("API v1 de tareas", () => {
  let tareaId: string;

  it("publica la especificación OpenAPI", async () => {
    const response = await request(app).get("/api/v1/openapi.json");
    assert.equal(response.status, 200);
    assert.equal(response.body.openapi, "3.0.3");
    assert.ok(response.body.paths["/tareas"].get);
  });

  it("usa el repositorio inyectado al crear recursos", async () => {
    class TrackingRepository extends InMemoryTareasRepository {
      created = false;

      override async create(data: Parameters<InMemoryTareasRepository["create"]>[0]) {
        this.created = true;
        return super.create(data);
      }
    }

    const repository = new TrackingRepository();
    const injectedApp = createApp({ tareasRepository: repository });
    const response = await request(injectedApp).post("/api/v1/tareas").send({ title: "Inyectada" });

    assert.equal(response.status, 201);
    assert.equal(repository.created, true);
  });

  it("crea, consulta, reemplaza, actualiza y elimina una tarea", async () => {
    const created = await request(app).post("/api/v1/tareas").send({ title: "Preparar entrega" });
    assert.equal(created.status, 201);
    assert.equal(created.body.data.title, "Preparar entrega");
    assert.equal(created.body.data.completed, false);
    tareaId = created.body.data.id;

    const fetched = await request(app).get(`/api/v1/tareas/${tareaId}`);
    assert.equal(fetched.status, 200);
    assert.equal(fetched.body.data.id, tareaId);

    const replaced = await request(app).put(`/api/v1/tareas/${tareaId}`).send({
      title: "Entrega final", description: "API REST", completed: false,
    });
    assert.equal(replaced.status, 200);
    assert.equal(replaced.body.data.title, "Entrega final");

    const patched = await request(app).patch(`/api/v1/tareas/${tareaId}`).send({ completed: true });
    assert.equal(patched.status, 200);
    assert.equal(patched.body.data.completed, true);

    const deleted = await request(app).delete(`/api/v1/tareas/${tareaId}`);
    assert.equal(deleted.status, 204);
    assert.equal((await request(app).get(`/api/v1/tareas/${tareaId}`)).status, 404);
  });

  it("valida el DTO y responde errores con forma uniforme", async () => {
    const response = await request(app).post("/api/v1/tareas").send({ title: "  " });
    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, "VALIDATION_ERROR");
    assert.ok(Array.isArray(response.body.error.details));
  });

  it("rechaza JSON mal formado con un error 400 uniforme", async () => {
    const response = await request(app)
      .post("/api/v1/tareas")
      .set("Content-Type", "application/json")
      .send("{");

    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, "INVALID_JSON");
    assert.equal(typeof response.body.error.message, "string");
  });

  it("filtra, ordena y pagina los resultados", async () => {
    await request(app).post("/api/v1/tareas").send({ title: "Alpha", completed: true });
    await request(app).post("/api/v1/tareas").send({ title: "Beta", completed: false });
    await request(app).post("/api/v1/tareas").send({ title: "Alpine", completed: true });

    const response = await request(app).get("/api/v1/tareas?q=Al&completed=true&sortBy=title&order=asc&page=1&limit=1");
    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].title, "Alpha");
    assert.deepEqual(response.body.pagination, { page: 1, limit: 1, total: 2, totalPages: 2 });
  });

  it("devuelve 404 uniforme para rutas desconocidas", async () => {
    const response = await request(app).get("/ruta-inexistente");
    assert.equal(response.status, 404);
    assert.equal(response.body.error.code, "ROUTE_NOT_FOUND");
  });
});