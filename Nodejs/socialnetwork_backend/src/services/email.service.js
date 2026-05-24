const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.Email_USER,
        pass: process.env.Email_PASS,
    },
});

const sendOTP = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"Social Network App" <${process.env.Email_USER}>`,
            to: email,
            subject: 'Account Verification',
            text: `Your OTP is: ${otp}. This code is valid for 1 minute. Please do not share it with others.`,
            html: `<h3>Hello!</h3>
                   <p>Your account verification code is: <strong>${otp}</strong></p>
                   <p>This code is valid for 1 minute. For security reasons, please do not share this code with others.</p>`,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

module.exports = { sendOTP };
