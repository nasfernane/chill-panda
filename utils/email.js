const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1) créer le transporteur
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // 2) définition des options de l'email
    const mailOptions = {
        from: 'Papa Panda <nasfernane@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    };

    // 3) envoi de l'email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
