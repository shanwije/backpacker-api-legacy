const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const colors = require('colors');
const aggregatedRouter = require('./aggregatedRouter');
const errorHandler = require('./common/middleware/errorHandlerMiddleware');
const connectDB = require('./common/db/dbSetup');

// load config
const configPath = path.resolve('config', 'config.env');
dotenv.config({ path: configPath, encoding: 'utf8' });

// -----------add anything new after this line--------

// connect with mongoDB
connectDB();

const app = express();

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
