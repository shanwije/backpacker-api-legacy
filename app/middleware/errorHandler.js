const errorHandler = (err, req, res, next) => {
    const { statusCode, message, stack, type, errorCode } = err;
    const errorBody = {
        success: false,
        error: {
            message,
        },
    };

    if (type) errorBody.error.type = type;
    if (errorCode) errorBody.error.errorCode = errorCode;
    if (stack) errorBody.error.stack = stack;

    console.log(JSON.stringify(errorBody, null, '\t').red);
    res.status(statusCode).json(errorBody);
};

module.exports = errorHandler;
