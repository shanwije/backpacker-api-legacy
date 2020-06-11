const express = require('express');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const user = require('../models/userModal');
const ErrorResponse = require('../../misc/ErrorResponse');
const statusCodes = require('../../misc/const/statusCodes');
const utils = require('../../misc/util');
const customErrorCodes = require('../../misc/const/customErrorCodes');

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
                    'Invalid email or password',
                    customErrorCodes.USER_RECORD_NOT_AVAILABLE,
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
                        customErrorCodes.INVALID_CREDENTIALS,
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
                'Email or password can not be empty',
                customErrorCodes.EMPTY,
            ),
        );
    }
});

router.post('/sign-up/email', async (req, res, next) => {
    try {
        const { email } = req.body;
        const forgotPassword = _.get(req, 'query.forgotPassword', 'false');

        const userRecord = await user.findOne({ email }).select('active');

        // new / fresh user
        if (!userRecord) {
            _.set(
                req,
                'body.emailVerificationToken',
                await utils.getRandomToken(5),
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
                    emailVerificationToken: await utils.getRandomToken(5),
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
                    customErrorCodes.ALREADY_ACTIVE,
                ),
            );
        }
    } catch (err) {
        next(new ErrorResponse(err, statusCodes.BAD_REQUEST));
    }
});

// required token, email
router.post('/sign-up/email-auth-token', async (req, res, next) => {
    try {
        const { email, token } = req.body;
        const forgotPassword = _.get(req, 'query.forgotPassword', 'false');

        const userRecord = await user
            .findOne({ email })
            .select('emailVerificationToken active emailTokenExpiresIn');

        if (!userRecord) {
            next(
                new ErrorResponse(
                    {},
                    statusCodes.FORBIDDEN,
                    'Invalid credentials',
                    customErrorCodes.USER_RECORD_NOT_AVAILABLE,
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
                    'This account is already in active state',
                    customErrorCodes.ALREADY_ACTIVE,
                ),
            );
        } else {
            const isExpired =
                new Date() > new Date(userRecord.emailTokenExpiresIn);
            const isMatch = _.isEqual(
                token.trim().toUpperCase(),
                userRecord.emailVerificationToken,
            );
            if (!isMatch) {
                next(
                    new ErrorResponse(
                        {},
                        statusCodes.FORBIDDEN,
                        'Invalid credentials',
                        customErrorCodes.INVALID_TOKEN,
                    ),
                );
            } else if (isExpired) {
                next(
                    new ErrorResponse(
                        {},
                        statusCodes.BAD_REQUEST,
                        `Your token has expired, Please request for a new token`,
                        customErrorCodes.EXPIRED_TOKEN,
                    ),
                );
            } else {
                const JWTToken = await userRecord.getSignedJWTToken({
                    emailVerificationToken: userRecord.emailVerificationToken,
                });
                res.status(statusCodes.OK).json({
                    success: true,
                    token: JWTToken,
                });
            }
        }
    } catch (err) {
        console.log(err);
        next(new ErrorResponse(err, statusCodes.INTERNAL_SERVER_ERROR));
    }
});

// required token, password, email
router.post('/sign-up/password', async (req, res, next) => {
    try {
        const { password } = req.body;
        const forgotPassword = _.get(req, 'query.forgotPassword', 'false');
        const bearerHeader = req.headers.authorization;

        if (bearerHeader) {
            const bearerToken = bearerHeader.split(' ')[1];
            const { JWT_SECRET } = process.env;
            const decoded = jwt.verify(bearerToken, JWT_SECRET);

            const userRecord = await user.findById(_.get(decoded, 'id', ''));

            if (!userRecord) {
                next(
                    new ErrorResponse(
                        {},
                        statusCodes.FORBIDDEN,
                        'Invalid credentials',
                        customErrorCodes.USER_RECORD_NOT_AVAILABLE,
                    ),
                );
            } else if (
                userRecord.active &&
                forgotPassword.trim().toLowerCase() === 'false'
            ) {
                next(
                    new ErrorResponse(
                        {},
                        statusCodes.FORBIDDEN,
                        'User already in active status',
                        customErrorCodes.ALREADY_ACTIVE,
                    ),
                );
            } else {
                const isExpired =
                    new Date() > new Date(userRecord.emailTokenExpiresIn);
                if (isExpired) {
                    next(
                        new ErrorResponse(
                            {},
                            statusCodes.BAD_REQUEST,
                            `Your token has expired, Please request for password with a new verified token`,
                            customErrorCodes.EXPIRED_TOKEN,
                        ),
                    );
                } else {
                    console.log(userRecord);
                    await user.findByIdAndUpdate(
                        // eslint-disable-next-line no-underscore-dangle
                        { _id: _.get(userRecord, 'id', 0) },
                        {
                            password: await utils.getEncryptedPassword(
                                password,
                            ),
                            active: true,
                            emailTokenExpiresIn: new Date(
                                Date.now() - 86400000,
                            ),
                        },
                    );
                    const token = await userRecord.getSignedJWTToken();
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
                    customErrorCodes.INVALID_TOKEN,
                ),
            );
        }
    } catch (err) {
        console.log(err);
        next(new ErrorResponse(err, statusCodes.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;
