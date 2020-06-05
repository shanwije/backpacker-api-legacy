const jsonwebtoken = require('jsonwebtoken');
const _ = require('lodash');
const user = require('../db/models/user');
const ErrorResponse = require('../util/ErrorResponse');
const statusCodes = require('../const/statusCodes');

async function jwtAuth(req, res, next) {
    const bearerHeader = req.headers.authorization;

    if (bearerHeader) {
        try {
            const bearerToken = bearerHeader.split(' ')[1];
            const decoded = jsonwebtoken.verify(
                bearerToken,
                process.env.JWT_SECRET,
            );
            console.log(decoded);

            req.user = await user.findById(_.get(decoded, 'id', ''));
            next();
        } catch (err) {
            next(
                new ErrorResponse(
                    err,
                    statusCodes.FORBIDDEN,
                ),
            );
        }
    } else {
        // Forbidden
        next(
            new ErrorResponse({}, statusCodes.FORBIDDEN, 'No token', '400004'),
        );
    }
}

module.exports = jwtAuth;
