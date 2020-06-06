const express = require('express');

const router = express.Router();
const protect = require('./common/middleware/auth/authenticationMiddleware');
const authorize = require('./common/middleware/auth/authorizationMiddleware');
const usersRouter = require('./common/routes/users');
const signInRouter = require('./common/routes/signIn');
const userRoles = require('./misc/const/userRoles');

router.use('/auth', signInRouter);

router.use(
    '/users',
    protect,
    authorize(userRoles.PUBLISHER, userRoles.USER),
    usersRouter,
);

module.exports = router;
