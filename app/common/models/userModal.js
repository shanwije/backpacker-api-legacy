/* eslint-disable no-useless-escape */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailService = require('../../misc/mailService');
const emailTemplates = require('../../misc/emailTemplates');
const { userRoles, activeStatus } = require('../../misc/const/loginConst');

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
            index: true,
        },
        password: {
            type: String,
            select: false,
            required: [false, 'password is required'],
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
        active: {
            type: String,
            enum: [
                activeStatus.ACTIVE,
                activeStatus.NOT_ACTIVE,
                activeStatus.BLOCKED,
            ],
            default: activeStatus.NOT_ACTIVE,
        },
        emailVerificationToken: { type: String, required: true },
        emailTokenExpiresIn: {
            type: Date,
            default: () => new Date(+new Date() + 24 * 60 * 60 * 1000), // 24 hours valid
        },
    },
    { timestamps: true },
);

userSchema.pre('save', async function emailToLowerCase(next) {
    this.email = this.email.toLowerCase();
    next();
});

// sign JWT and return
userSchema.methods.getSignedJWTToken = function (payload = {}) {
    const { JWT_EXPIRE, JWT_SECRET } = process.env;
    return jwt.sign(
        {
            id: this.id,
            email: this.email,
            ...payload,
        },
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRE,
        },
    );
};

// match user entered password to password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// send email withemail verification token
userSchema.methods.sendVerificationEmail = async function () {
    const emailBody = await emailTemplates.getVerificationEmailBody(
        this.email,
        this.emailVerificationToken,
    );
    if (process.env.NODE_ENV === 'production') {
        return mailService.sendEmail(this.email, emailBody);
    }
    console.log('only in production email service is active');
    return 0;
};

module.exports = mongoose.model('user', userSchema);
