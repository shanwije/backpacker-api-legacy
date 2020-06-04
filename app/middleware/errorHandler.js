const errorHandler = (err, req, res, next) => {
    const { statusCode, message, stack, type } = err;
    const json = {
        success: false,
        error: {
            type,
            message,
            stack,
        },
    };
    console.log(JSON.stringify(json, null, '\t').red);
    res.status(statusCode).json(json);
};

module.exports = errorHandler;
