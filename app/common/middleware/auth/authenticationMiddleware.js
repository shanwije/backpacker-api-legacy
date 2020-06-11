const jwt = require('jsonwebtoken');
const _ = require('lodash');
const customErrorCodes = require('../../../misc/const/customErrorCodes');
const user = require('../../models/userModal');
const ErrorResponse = require('../../../misc/ErrorResponse');
const statusCodes = require('../../../misc/const/statusCodes');

async function jwtAuth(req, res, next) {
    const bearerHeader = req.headers.authorization;

    if (bearerHeader) {
        try {
            const bearerToken = bearerHeader.split(' ')[1];
            const { JWT_SECRET } = process.env;
            const decoded = jwt.verify(bearerToken, JWT_SECRET);
            console.log('decoded user', decoded);

            req.user = await user.findById(_.get(decoded, 'id', ''));

            if (req.user.active) {
                next();
            } else {
                next(
                    new ErrorResponse(
                        {},
                        statusCodes.FORBIDDEN,
                        'User not in active state',
                        customErrorCodes.NOT_ACTIVE,
                    ),
                );
            }
        } catch (err) {
            next(new ErrorResponse(err, statusCodes.FORBIDDEN));
        }
    } else {
        // Forbidden
        next(
            new ErrorResponse({}, statusCodes.FORBIDDEN, 'No token', '400004'),
        );
    }
}

module.exports = jwtAuth;
