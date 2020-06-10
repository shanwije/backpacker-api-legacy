const express = require('express');
const _ = require('lodash');
const user = require('../models/userModal');
const ErrorResponse = require('../../misc/ErrorResponse');
const statusCodes = require('../../misc/const/statusCodes');
const utils = require('../../misc/util');

const router = express.Router();

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
                        '400002',
                    ),
                );
            } else {
                const token = userRecord.getSignedJWTToken();
                res.status(statusCodes.OK).json({
                    success: true,
                    token,
                });
            }
        }
    } else {
        next(
            new ErrorResponse(
                {},
                statusCodes.FORBIDDEN,
                'email or password can not be empty',
                '400003',
            ),
        );
    }
});

// router.get('/sign-in', async (req, res, next) => {
//     try {
//         const usersRecord = await user.find();
//         res.status(statusCodes.CREATED).json({
//             success: true,
//             data: usersRecord,
//         });
//     } catch (err) {
//         next(new ErrorResponse(err, statusCodes.BAD_REQUEST));
//     }
// });

router.post('/sign-up', async (req, res, next) => {
    if (_.get(req, 'body.password') || _.get(req, 'body.email')) {
        next(
            new ErrorResponse(
                '',
                statusCodes.BAD_REQUEST,
                'Please provide a proper email and password',
            ),
        );
    } else {
        try {
            const userRecord = await user.create(req.body);
            const token = userRecord.getSignedJWTToken();
            res.status(statusCodes.CREATED).json({
                success: true,
                token,
            });
        } catch (err) {
            next(new ErrorResponse(err, statusCodes.BAD_REQUEST));
        }
    }
});

router.post('/sign-up/email', async (req, res, next) => {
    try {
        const { email } = req.body;
        const { forgotPassword } = req.query;

        const userRecord = await user.findOne({ email }).select('active');

        // new / fresh user
        if (!userRecord) {
            _.set(
                req,
                'body.emailVerificationToken',
                await utils.getRandomToken(6),
            );
            const successRecord = await user.create(req.body);
            res.status(statusCodes.CREATED).json({
                success: true,
            });
            await successRecord.sendVerificationEmail();
        } else if (
            !userRecord.active ||
            forgotPassword.trim().toLowerCase() === 'true'
        ) {
            // user has a record but email not validated or for forgot password users
            const successRecord = await user.findOneAndUpdate(
                { email },
                {
                    emailVerificationToken: await utils.getRandomToken(6),
                    emailTokenExpiresIn: new Date(Date.now() + 86400000),
                },
            );
            res.status(statusCodes.CREATED).json({
                success: true,
            });
            await successRecord.sendVerificationEmail();
        } else {
            next(
                new ErrorResponse(
                    '',
                    statusCodes.BAD_REQUEST,
                    'This account is already in active state',
                    '11000',
                ),
            );
        }
    } catch (err) {
        next(new ErrorResponse(err, statusCodes.BAD_REQUEST));
    }
});
// required emailVerificationToken, password, email
router.post('/sign-up/password', async (req, res, next) => {
    try {
        const { email, emailVerificationToken, password } = req.body;
        const { forgotPassword } = req.query;

        const userRecord = await user
            .findOne({ email })
            .select('emailVerificationToken active emailTokenExpiresIn');

        if (!userRecord) {
            next(
                new ErrorResponse(
                    {},
                    statusCodes.FORBIDDEN,
                    'Invalid credentials',
                    '400001',
                ),
            );
        } else if (
            forgotPassword.trim().toLowerCase() === 'false' &&
            userRecord.active
        ) {
            next(
                new ErrorResponse(
                    {},
                    statusCodes.BAD_REQUEST,
                    `${email} already in active state`,
                    '325555',
                ),
            );
        } else {
            const isExpired =
                new Date() > new Date(userRecord.emailTokenExpiresIn);
            const isMatch = _.isEqual(
                emailVerificationToken.trim().toUpperCase(),
                userRecord.emailVerificationToken,
            );
            if (!isMatch) {
                next(
                    new ErrorResponse(
                        {},
                        statusCodes.FORBIDDEN,
                        'Invalid credentials',
                        '400001',
                    ),
                );
            } else if (isExpired) {
                next(
                    new ErrorResponse(
                        {},
                        statusCodes.BAD_REQUEST,
                        `${email} ,token has expired`,
                        '325555',
                    ),
                );
            } else {
                await user.findOneAndUpdate(
                    { email },
                    {
                        password: await utils.getEncryptedPassword(password),
                        active: true,
                        emailTokenExpiresIn: new Date(Date.now() - 86400000),
                    },
                );
                const token = await userRecord.getSignedJWTToken();
                res.status(statusCodes.OK).json({
                    success: true,
                    token,
                });
            }
        }
    } catch (err) {
        console.log(err);
        next(new ErrorResponse(err, statusCodes.BAD_REQUEST));
    }
});

module.exports = router;
