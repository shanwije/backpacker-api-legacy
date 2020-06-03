const express = require('express');

const router = express.Router();

const indexRouter = require('./index');
const usersRouter = require('./users');
const authRouter = require('./auth');

router.use('/', indexRouter);
router.use('/users', usersRouter);
router.use('/auth', authRouter);

module.exports = router;
