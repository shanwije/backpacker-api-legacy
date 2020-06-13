const nodemailer = require('nodemailer');

const sendEmail = async function (email, template) {
    console.log(`sending email to ${email}`);
    const { subject, text } = template;
    try {
        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER, // generated ethereal user
                pass: process.env.MAIL_PASSWORD, // generated ethereal password
            },
        });

        const info = await transporter.sendMail({
            from: `"Backpacker Team" ${process.env.MAIL_USER}`, // sender address
            to: email, // list of receivers
            subject, // Subject line
            text, // plain text body
        });
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (e) {
        console.log('Email sent error'.red, e.message);
        return false;
    }
};

exports.sendEmail = sendEmail;
