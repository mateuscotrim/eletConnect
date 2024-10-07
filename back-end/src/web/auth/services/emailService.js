const nodemailer = require('nodemailer');

async function sendEmail(email, subject, text) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.sendMail({
            from: '"AUTH - eletConnect" <eletconnect@outlook.com>',
            to: email,
            subject,
            text
        });

        return true;
    } catch (error) {
        console.error('[Auth: e-mail]:', error);
        return false;
    }
}

module.exports = { sendEmail };
