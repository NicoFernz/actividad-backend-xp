import { AppError } from "../errors/app-error.js";
import type {
  CreateTareaDto,
  ListTareasQuery,
  PatchTareaDto,
  ReplaceTareaDto,
  Tarea,
} from "./tarea.js";
import type { TareasRepository } from "./tareas.repository.js";

export interface TareasPage {
  data: Tarea[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export class TareasService {
  constructor(private readonly repository: TareasRepository) {}

  async list(query: ListTareasQuery): Promise<TareasPage> {
    let tareas = await this.repository.findAll();
    if (query.q) {
      const term = query.q.toLocaleLowerCase();
      tareas = tareas.filter(({ title, description }) =>
        `${title} ${description}`.toLocaleLowerCase().includes(term));
    }
    if (query.completed !== undefined) {
      const completed = query.completed === "true";
      tareas = tareas.filter((tarea) => tarea.completed === completed);
    }

    const direction = query.order === "asc" ? 1 : -1;
    tareas.sort((first, second) => {
      const firstValue = first[query.sortBy];
      const secondValue = second[query.sortBy];
      return direction * (firstValue < secondValue ? -1 : firstValue > secondValue ? 1 : 0);
    });

    const total = tareas.length;
    const start = (query.page - 1) * query.limit;
    return {
      data: tareas.slice(start, start + query.limit),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async get(id: string): Promise<Tarea> {
    const tarea = await this.repository.findById(id);
    if (!tarea) throw new AppError(404, "TAREA_NOT_FOUND", "No se encontró la tarea solicitada.");
    return tarea;
  }

  create(data: CreateTareaDto): Promise<Tarea> {
    return this.repository.create(data);
  }

  async replace(id: string, data: ReplaceTareaDto): Promise<Tarea> {
    const updated = await this.repository.update(id, data);
    if (!updated) throw new AppError(404, "TAREA_NOT_FOUND", "No se encontró la tarea solicitada.");
    return updated;
  }

  async patch(id: string, changes: PatchTareaDto): Promise<Tarea> {
    const current = await this.get(id);
    const updated = await this.repository.update(id, { ...current, ...changes });
    if (!updated) throw new AppError(404, "TAREA_NOT_FOUND", "No se encontró la tarea solicitada.");
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!await this.repository.delete(id)) {
      throw new AppError(404, "TAREA_NOT_FOUND", "No se encontró la tarea solicitada.");
    }
  }
}