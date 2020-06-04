const mongoose = require('mongoose');

const connectMongo = async () => {
    try {
        const mongoConn = await mongoose.connect(process.env.DB_MONGO_URI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        });
        console.log(
            'mongodb connected'.green,
            mongoConn.connection.host.yellow,
        );
    } catch (err) {
        console.error('db connectivity failed'.red, err.red);
        process.exit(1);
    }
};

module.exports = connectMongo;
