const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const hpp = require('hpp');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const colors = require('colors');
const aggregatedRouter = require('./aggregatedRouter');
const errorHandler = require('./common/middleware/errorHandlerMiddleware');
const connectDB = require('./common/db/dbSetup');

// load config
const configPath = path.resolve('config', 'config.env');
dotenv.config({ path: configPath, encoding: 'utf8' });

// -----------add anything new after this line--------

const app = express();

/**
 * connect with mongoDB
 */
connectDB();

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
app.use('/api/v1/', aggregatedRouter);
app.use(errorHandler);

module.exports = app;
