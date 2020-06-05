const express = require('express');
const _ = require('lodash');
const user = require('../db/models/user');
const ErrorResponse = require('../util/ErrorResponse');
const statusCodes = require('../const/statusCodes');

const router = express.Router();

router.post('/sign-up', async (req, res, next) => {
    try {
        const userRecord = await user.create(req.body);
        const token = userRecord.getSignedJWTToken();

        res.status(statusCodes.CREATED).json({
            success: true,
            data: { id: _.get(userRecord, 'id'), token },
        });
    } catch (err) {
        next(new ErrorResponse(err, statusCodes.BAD_REQUEST));
    }
});

router.post('/sign-in', async (req, res, next) => {
    const { email, password } = _.get(req, 'body', {});
    if (email && password) {
        const userRecord = await user.findOne({ email }).select('+password');
        if (!userRecord) {
            next(
                new ErrorResponse(
                    {},
                    statusCodes.FORBIDDEN,
                    'Invalid credentials',
                    '400001',
                ),
            );
        } else {
            const isMatch = await userRecord.matchPassword(password);
            if (!isMatch) {
                next(
                    new ErrorResponse(
                        {},
                        statusCodes.FORBIDDEN,
                        'Invalid credentials',
                        '400001',
                    ),
                );
            } else {
                const token = userRecord.getSignedJWTToken();
                res.status(statusCodes.OK).json({
                    success: true,
                    data: { token },
                });
            }
        }
        console.log(user.red);
    } else {
        next(
            new ErrorResponse(
                {},
                statusCodes.FORBIDDEN,
                'email or password can not be empty',
                '400002',
            ),
        );
    }
});

router.get('/sign-in', async (req, res, next) => {
    try {
        const usersRecord = await user.find();
        res.status(statusCodes.CREATED).json({
            success: true,
            data: usersRecord,
        });
    } catch (err) {
        next(new ErrorResponse(err, statusCodes.BAD_REQUEST));
    }
});

// router.get('/sign-in/:id', (req, res, next) => {
//     try {
//         user.findById(req.params.id, (err, users) => {
//             if (err) {
//                 console.log(err.name.green);
//                 next(new ErrorResponse(err, statusCodes.NOT_FOUND));
//             } else {
//                 res.status(statusCodes.OK).json({
//                     success: true,
//                     data: users,
//                 });
//             }
//         });
//     } catch (err) {
//         next(new ErrorResponse(err, statusCodes.BAD_REQUEST));
//     }
// });

module.exports = router;

// var express = require('express');
// var router = express.Router();
//
// router.get('/', function(req, res, next) {
//     res.send('respond with a resource');
// });
//
// module.exports = router;
