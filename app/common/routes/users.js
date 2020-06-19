const express = require('express');
const multer = require('multer');
const S3 = require('aws-sdk/clients/s3');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const s3 = new S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
});
const storage = multer.memoryStorage({
    destination: (req, file, callback) => {
        callback(null, '');
    },
});

const upload = multer(storage).single('image');

router.post('/upload', upload, (req, res, next) => {
    const uploadingImage = req.file.originalname.split('.');
    const fileType = uploadingImage[uploadingImage.length - 1];
    console.log(req.file);
    // res.send('respond with a resource');

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}.${fileType}`,
        Body: req.file.buffer,
        ACL: 'public-read',
    };

    const promise = s3.getSignedUrlPromise('putObject', params);
    promise.then(
        function (url) {
            console.log('The URL is', url);
            res.status(201).json({ url });
        },
        function (err) {
            res.status(201).json({ err });
        },
    );
    // s3.upload(params, (error, data) => {
    //     if (error) {
    //         res.status(500).json({ error });
    //     } else {
    //         res.status(201).json({ data });
    //     }
    // });
});

router.post('/upload', upload, (req, res, next) => {
    const uploadingImage = req.file.originalname.split('.');
    const fileType = uploadingImage[uploadingImage.length - 1];
    console.log(req.file);
    // res.send('respond with a resource');

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}.${fileType}`,
        Body: req.file.buffer,
    };
    s3.upload(params, (error, data) => {
        if (error) {
            res.status(500).json({ error });
        } else {
            res.status(201).json({ data });
        }
    });
});

router.get('/signed-url', upload, (req, res, next) => {
    const { fileName } = req.query;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
    };

    const promise = s3.getSignedUrlPromise('getObject', params);
    promise.then(
        function (url) {
            console.log('The URL is', url);
            res.status(201).json({ url });
        },
        function (err) {
            res.status(201).json({ err });
        },
    );

    // s3.getSignedUrlPromise(params, (error, data) => {
    //     if (error) {
    //         res.status(500).json({ error });
    //     } else {
    //         res.status(201).json({ data });
    //     }
    // });
});

router.get('/', (req, res, next) => {
    res.send('respond with a resource');
});

module.exports = router;
