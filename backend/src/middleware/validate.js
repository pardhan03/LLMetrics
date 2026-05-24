export const validate = (schema) => {
    return (req, res, next) => {
        try {
            req.validated = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            next();
        } catch (error) {
            next(error);
        }
    };
};