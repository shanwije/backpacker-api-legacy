/* eslint-disable no-useless-escape */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailService = require('../../misc/mailService');
const emailTemplates = require('../../misc/emailTemplates');
const userRoles = require('../../misc/const/userRoles');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            match: [
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'please provide a valid email',
            ],
            required: [true, 'required a name'],
            maxLength: [50, 'email max length cannot exceed 50 chars '],
            trim: true,
            unique: [true, 'this email is already exists'],
        },
        password: {
            type: String,
            select: false,
            required: [true, 'password is required'],
            minlength: 6,
            maxlength: 20,
        },
        role: {
            type: String,
            enum: [userRoles.PUBLISHER, userRoles.USER],
            default: userRoles.USER,
        },
        resetPasswordToken: String,
        resetPasswordExpired: Date,
        emailVerification: {
            token: String,
            status: { type: Boolean, default: false },
        },
    },
    { timestamps: true },
);
userSchema.methods.sendVerificationEmail = async function () {
    // todo : implement token generation function
    const token = '1111';
    // todo : persist token in db's correct record
    return mailService.sendEmail(
        this.email,
        emailTemplates.getVerificationEmailBody(this.email, token),
    );
};

userSchema.pre('save', function emailToLowerCase(next) {
    this.email = this.email.toLowerCase();
    next();
});

// encrypt password
userSchema.pre('save', async function encryptPassword(next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// sign JWT and return
userSchema.methods.getSignedJWTToken = function () {
    const { JWT_EXPIRE, JWT_SECRET } = process.env;
    return jwt.sign({ id: this.id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRE,
    });
};

// match user entered password to password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('user', userSchema);
