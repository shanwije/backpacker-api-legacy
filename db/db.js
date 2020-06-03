const mongoose = require('mongoose');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const connectMongo = async () => {
    const mongoConn = await mongoose.connect(process.env.DB_MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    });
    console.log('mongodb connected', mongoConn.connection.host);
};

module.exports = connectMongo;
