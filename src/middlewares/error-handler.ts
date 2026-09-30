import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    if (error instanceof AppError) {
        response.status(error.statusCode).json({
            error: {
                code: error.code,
                message: error.message,
                ...(error.details === undefined ? {} : { details: error.details }),
            },
        });
        return;
    }

    if (error instanceof ZodError) {
        response.status(400).json({
            error: {
                code: "VALIDATION_ERROR",
                message: "La solicitud contiene datos inválidos.",
                details: error.issues.map(({ path, message }) => ({ path: path.join("."), message })),
            },
        });
        return;
    }

    if (error instanceof SyntaxError && "body" in error) {
        response.status(400).json({
            error: {
                code: "INVALID_JSON",
                message: "El cuerpo de la solicitud no contiene JSON válido.",
            },
        });
        return;
    }

    response.status(500).json({
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Ocurrió un error interno.",
        },
    });
};