import { randomUUID } from "node:crypto";
import type { Tarea } from "./tarea.js";

export type TareaChanges = Pick<Tarea, "title" | "description" | "completed">;

export interface TareasRepository {
  findAll(): Promise<Tarea[]>;
  findById(id: string): Promise<Tarea | undefined>;
  create(data: TareaChanges): Promise<Tarea>;
  update(id: string, data: TareaChanges): Promise<Tarea | undefined>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryTareasRepository implements TareasRepository {
  private readonly tareas = new Map<string, Tarea>();

  async findAll(): Promise<Tarea[]> {
    return [...this.tareas.values()];
  }

  async findById(id: string): Promise<Tarea | undefined> {
    return this.tareas.get(id);
  }

  async create(data: TareaChanges): Promise<Tarea> {
    const now = new Date().toISOString();
    const tarea: Tarea = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
    this.tareas.set(tarea.id, tarea);
    return tarea;
  }

  async update(id: string, data: TareaChanges): Promise<Tarea | undefined> {
    const current = this.tareas.get(id);
    if (!current) return undefined;

    const updated: Tarea = { ...current, ...data, updatedAt: new Date().toISOString() };
    this.tareas.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.tareas.delete(id);
  }
}