module.exports = (req, res, next) => {
    const message = {};
    message.data = req.responseObject;
    message.success = true;
    message.status = req.responseStatus || 200;
    res.status(message.status).json(message);
    return next();
};
