const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const rfs = require('rotating-file-stream');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const colors = require('colors');
const aggregatedRouter = require('./routes/aggregatedRouter');
const errorHandler = require('./middleware/errorHandler');

const connectDB = require('./db/db');

// load config
const configPath = path.resolve('config', 'config.env');
dotenv.config({ path: configPath, encoding: 'utf8' });

// -----------add anything new after this line--------

// connect with mongoDB
connectDB();

const app = express();

// create a rotating write stream
// setup the logger
const accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log'),
});
const loggingFormat =
    process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(logger(loggingFormat, { stream: accessLogStream }));

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use((req, res, next)=> {
//     console.log(JSON.stringify(req, null, '\t'));
//     next();
// });

// mount routers
app.use('/api/v1/', aggregatedRouter);
app.use(errorHandler);

module.exports = app;
