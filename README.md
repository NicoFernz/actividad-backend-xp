# API de tareas

API REST para gestionar tareas, construida con TypeScript, Express y almacenamiento temporal en memoria.

## Requisitos

- Node.js 20 o superior
- npm

## Instalación y ejecución

```sh
npm install
npm run dev
```

La API queda disponible en `http://localhost:3000/api/v1`. La documentación Swagger UI está en `http://localhost:3000/docs` y el documento OpenAPI en `http://localhost:3000/api/v1/openapi.json`.

```sh
npm test
npm run build
npm start
```

`npm start` ejecuta la compilación de `dist`; ejecuta `npm run build` antes de iniciarlo. El puerto se puede configurar con la variable `PORT`.

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
| --- | --- | --- | --- |
| `GET` | `/api/v1/tareas` | Listar, buscar y paginar tareas | `200` |
| `GET` | `/api/v1/tareas/:id` | Consultar una tarea | `200` |
| `POST` | `/api/v1/tareas` | Crear una tarea | `201` |
| `PUT` | `/api/v1/tareas/:id` | Reemplazar todos los campos editables | `200` |
| `PATCH` | `/api/v1/tareas/:id` | Actualizar campos enviados | `200` |
| `DELETE` | `/api/v1/tareas/:id` | Eliminar una tarea | `204` |

Parámetros de listado: `q` busca en título y descripción; `completed` filtra por estado; `sortBy` acepta `createdAt`, `updatedAt` o `title`; `order` acepta `asc` o `desc`; `page` empieza en 1 y `limit` acepta de 1 a 100 (por defecto 10).

Ejemplo de creación:

```json
{
  "title": "Preparar entrega",
  "description": "Revisar los endpoints",
  "completed": false
}
```

Los elementos se devuelven dentro de `{ "data": ... }`. El listado agrega `pagination` con `page`, `limit`, `total` y `totalPages`. Los errores comparten la forma `{ "error": { "code": "...", "message": "...", "details": [] } }`; `details` se incluye cuando aplica. Los códigos usados incluyen `400` (validación), `404` (recurso/ruta inexistente) y `500` (error interno). `DELETE` exitoso devuelve cuerpo vacío.

## Arquitectura

```text
src/
├── app.ts
├── server.ts
├── docs/openapi.ts
├── errors/app-error.ts
├── middlewares/
│   ├── error-handler.ts
│   └── not-found.ts
└── tareas/
    ├── tarea.ts
    ├── tareas.routes.ts
    ├── tareas.controller.ts
    ├── tareas.service.ts
    └── tareas.repository.ts
```

`createApp` recibe el repositorio por inyección de dependencias y usa el repositorio en memoria por defecto. El almacenamiento se reinicia al detener el proceso.

## Matriz de pruebas

| Caso | Resultado esperado | Cobertura |
| --- | --- | --- |
| Consultar especificación OpenAPI | `200` y rutas documentadas | `tareas.test.ts` |
| Crear, obtener, reemplazar y actualizar parcialmente | `201`, `200` y datos actualizados | `tareas.test.ts` |
| Eliminar y consultar el recurso eliminado | `204`, después `404` uniforme | `tareas.test.ts` |
| Enviar un DTO inválido | `400` con `VALIDATION_ERROR` y detalles | `tareas.test.ts` |
| Buscar, filtrar, ordenar y paginar | Elementos y metadatos correctos | `tareas.test.ts` |
| Solicitar una ruta inexistente | `404` con `ROUTE_NOT_FOUND` | `tareas.test.ts` |

Ejecuta la matriz con `npm test` y verifica tipos/compilación con `npm run build`.

## Historial de commits

La rama parte del commit `Initial commit`. Para mantener el historial significativo solicitado, los cambios de esta implementación se deben registrar en commits atómicos, por ejemplo:

1. `feat: scaffold TypeScript Express API`
2. `feat: implement in-memory tasks CRUD and validation`
3. `docs: add OpenAPI spec and CRUD test matrix`