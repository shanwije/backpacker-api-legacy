const express = require('express');
const user = require('./../db/models/user');

const router = express.Router();

router.post('/sign-in', function (req, res, next) {
    console.log('sign-in', req.body);

    user.create(req.body)
        .then((userRecord) => {
            res.status(201).json({
                success: true,
                data: userRecord,
            });
        })
        .catch((err) =>
            res.status(500).json({ success: false, error: err.message }),
        );
});

router.get('/sign-in', function (req, res, next) {
    try {
        user.find({ email: req.query.email }, function (err, users) {
            if (err) {
                res.status(500).json({ success: false, error: err.message });
            } else {
                res.status(201).json({
                    success: true,
                    data: users,
                });
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
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
