const _ = require('lodash');
const ErrorResponse = require('../../../misc/ErrorResponse');
const statusCodes = require('../../../misc/const/statusCodes');

const authorize = (...roles) => {
    return (req, res, next) => {
        console.log('roles', roles.red);
        if (!roles.includes(_.get(req, 'user.role', null))) {
            return next(
                new ErrorResponse(
                    {},
                    statusCodes.UNAUTHORIZED,
                    'No authorizations granted for this user for this resource',
                    '50002',
                ),
            );
        }
        next();
    };
};

module.exports = authorize;
