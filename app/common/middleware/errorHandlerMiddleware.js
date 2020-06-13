const errorHandlerMiddleware = (err, req, res, next) => {
    const { statusCode, message, stack, type, errorCode } = err;
    const errorBody = {
        success: false,
        message,
    };

    errorBody.type = type;
    errorBody.code = errorCode; // code not errorCode
    if (stack) errorBody.stack = stack;

    console.log(req.url, JSON.stringify(errorBody).red);
    res.status(statusCode).json(errorBody);
};

module.exports = errorHandlerMiddleware;
