const mongoose = require('mongoose');

const connectMongo = async () => {
    try {
        const mongoConn = await mongoose.connect(process.env.DB_MONGO_URI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        });
        console.log('mongodb connected', mongoConn.connection.host);
    } catch (err) {
        console.log('db connection error', err);
    }
};

module.exports = connectMongo;
