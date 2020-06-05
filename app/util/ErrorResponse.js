const _ = require('lodash');
const statusCodes = require('../const/statusCodes');

class ErrorResponse extends Error {
    constructor(err, statusCode, message, errorCode) {
        super(message || _.get(err, 'message', ''));
        this.type = _.get(err, 'name', null);
        this.statusCode = statusCode || 500;
        this.stack = _.isEmpty(err)
            ? null
            : _.get(err, 'stack', 'null').split('\n');
        this.errorCode = errorCode || _.get(err, 'name', null) || '000000';
    }
}

module.exports = ErrorResponse;
