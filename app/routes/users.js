const express = require('express');
const jwtAuth = require('../middleware/authHandler');

const router = express.Router();

router.get('/', jwtAuth, (req, res, next) => {
    res.send('respond with a resource');
});

module.exports = router;
