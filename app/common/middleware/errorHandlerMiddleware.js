const errorHandlerMiddleware = (err, req, res, next) => {
    const { statusCode, message, stack, type, errorCode } = err;
    const errorBody = {
        success: false,
        error: {
            message,
        },
    };

    if (type) errorBody.error.type = type;
    if (errorCode) errorBody.error.errorCode = errorCode;
    // if (stack) errorBody.error.stack = stack;

    console.log(req.url, JSON.stringify(errorBody).red);
    res.status(statusCode).json(errorBody);
};

module.exports = errorHandlerMiddleware;
