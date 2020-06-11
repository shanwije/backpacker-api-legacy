const express = require('express');

const router = express.Router();
const authenticate = require('./common/middleware/auth/authenticationMiddleware');
const authorize = require('./common/middleware/auth/authorizationMiddleware');
const usersRouter = require('./common/routes/users');
const signInRouter = require('./common/routes/signIn');
const { userRoles } = require('./misc/const/loginConst');

router.use('/auth', signInRouter);

router.use(
    '/users',
    authenticate,
    authorize(userRoles.PUBLISHER, userRoles.USER),
    usersRouter,
);

module.exports = router;
