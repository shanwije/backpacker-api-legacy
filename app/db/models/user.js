const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        match: [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'please provide a valid email',
        ],
        required: [true, 'required a name'],
        maxlength: [50, 'email max length cannot exceed 50 chars '],
        trim: true,
        unique: true,
    },
    slug: String,
    password: {
        type: String,
        required: true,
        maxlength: 20,
    },
});

module.exports = mongoose.model('user', userSchema);
