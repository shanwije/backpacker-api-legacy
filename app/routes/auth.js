const express = require('express');

const router = express.Router();

router.post('/sign-in', function (req, res, next) {
    console.log('sign-in', req.body);
    res.send('index');
});

module.exports = router;

// var express = require('express');
// var router = express.Router();
//
// router.get('/', function(req, res, next) {
//     res.send('respond with a resource');
// });
//
// module.exports = router;
