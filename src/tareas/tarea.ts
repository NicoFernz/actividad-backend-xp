import { z } from "zod";

export interface Tarea {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export const createTareaSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional().default(""),
  completed: z.boolean().optional().default(false),
}).strict();

export const replaceTareaSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional().default(""),
  completed: z.boolean(),
}).strict();

export const patchTareaSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  completed: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: "Debe enviar al menos un campo para actualizar.",
});

export const listTareasQuerySchema = z.object({
  q: z.string().trim().optional(),
  completed: z.enum(["true", "false"]).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "title"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
}).strict();

export type CreateTareaDto = z.infer<typeof createTareaSchema>;
export type ReplaceTareaDto = z.infer<typeof replaceTareaSchema>;
export type PatchTareaDto = z.infer<typeof patchTareaSchema>;
export type ListTareasQuery = z.infer<typeof listTareasQuerySchema>;