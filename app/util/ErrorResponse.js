const _ = require('lodash');
const statusCodes = require('../const/statusCodes');

class ErrorResponse extends Error {
    constructor(err, statusCode, message = null) {
        super(message || _.get(err, 'message', ''));
        this.type = _.get(err, 'name', '');
        this.statusCode = statusCode || 500;
        this.stack = _.get(err, 'stack', '').split('\n');
    }
}

module.exports = ErrorResponse;
