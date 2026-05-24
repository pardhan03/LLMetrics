import { ZodError } from 'zod';

export function errorHandler(
    err,
    req,
    res,
    next
) {
    console.error(err);

    if (err instanceof ZodError) {
        return res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: err.errors,
            },
        });
    }

    res.status(err.status || 500).json({
        error: {
            code:
                err.code || 'INTERNAL_SERVER_ERROR',

            message:
                err.message || 'Something went wrong',
        },
    });
}