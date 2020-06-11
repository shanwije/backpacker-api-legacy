const jwt = require('jsonwebtoken');
const _ = require('lodash');
const { activeStatus } = require('../../../misc/const/loginConst');
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

            if (req.user.active === activeStatus.BLOCKED) {
                next(
                    new ErrorResponse(
                        {},
                        statusCodes.FORBIDDEN,
                        'This user account is blocked',
                        customErrorCodes.NOT_ACTIVE,
                    ),
                );
            } else if (req.user.active === activeStatus.NOT_ACTIVE) {
                next(
                    new ErrorResponse(
                        {},
                        statusCodes.FORBIDDEN,
                        'User not in active state',
                        customErrorCodes.NOT_ACTIVE,
                    ),
                );
            } else {
                next();
            }
        } catch (err) {
            next(
                new ErrorResponse(
                    err,
                    statusCodes.FORBIDDEN,
                    customErrorCodes.INVALID_TOKEN,
                ),
            );
        }
    } else {
        next(
            new ErrorResponse(
                {},
                statusCodes.FORBIDDEN,
                'No token',
                customErrorCodes.EMPTY,
            ),
        );
    }
}

module.exports = jwtAuth;
