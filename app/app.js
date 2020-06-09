const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const hpp = require('hpp');
const cors = require('cors');

const logger = require('morgan');
const rfs = require('rotating-file-stream');

const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const colors = require('colors');

const aggregatedRouter = require('./aggregatedRouter');
const errorHandler = require('./common/middleware/errorHandlerMiddleware');
const connectDB = require('./common/db/dbSetup');
// const connectRedis = require('./common/cache/redisSetup');

// load config
const configPath = path.resolve('config', 'config.env');
dotenv.config({ path: configPath, encoding: 'utf8' });

// -----------add anything new after this line--------

const app = express();

// create a rotating write stream
// setup the logger
const accessLogStream = rfs.createStream('access.log', {
    interval: '7d', // rotate weekly
    path: path.join(__dirname, '..', 'logs'),
});

// log all requests to access.log
app.use(logger('combined', { stream: accessLogStream }));

if (process.env.NODE_ENV === 'development') {
    app.use(logger('dev'));
}
/**
 * connect with mongoDB
 */
connectDB();

/**
 * connect with redis
 */
// connectRedis();

/**
 * limit tps count
 */
const limiter = rateLimit({
    windowMs: 1000 * 60, // 1 min
    max: 40,
});
app.use(limiter);

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/**
 * prevent http pollution attacks
 */
app.use(hpp());

/**
 * enable cors
 */
app.use(cors());

// mount routers
const { BASE_PATH, API_VERSION } = process.env;
app.use(`/${BASE_PATH}/${API_VERSION}/`, aggregatedRouter);
app.use(errorHandler);

module.exports = app;
