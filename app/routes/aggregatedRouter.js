const express = require('express');

const router = express.Router();
const responseSender = require('../middleware/responseSender');

const indexRouter = require('./index');
const usersRouter = require('./users');
const signInRouter = require('./signIn');

router.use('/', indexRouter);
router.use('/users', usersRouter);
router.use('/auth', signInRouter);

module.exports = router;
