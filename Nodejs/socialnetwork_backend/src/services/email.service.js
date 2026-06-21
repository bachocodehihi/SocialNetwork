const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTP = async (email, otp) => {
    try {
        // Lưu ý: Với tài khoản Resend Free chưa cấu hình Domain riêng:
        // 1. Phải gửi từ địa chỉ: 'onboarding@resend.dev'
        // 2. Chỉ gửi được đến chính email đăng ký Resend của bạn (quybach2611@gmail.com).
        // Muốn gửi cho mọi email khác, bạn cần Add Domain của bạn vào Resend dashboard và xác minh DNS.
        const response = await resend.emails.send({
            from: 'Social Network App <onboarding@resend.dev>',
            to: email,
            subject: 'Account Verification',
            text: `Your OTP is: ${otp}. This code is valid for 1 minute. Please do not share it with others.`,
            html: `<h3>Hello!</h3>
                   <p>Your account verification code is: <strong>${otp}</strong></p>
                   <p>This code is valid for 1 minute. For security reasons, please do not share this code with others.</p>`,
        });

        if (response.error) {
            console.error("Resend API returned error:", response.error);
            throw new Error(response.error.message);
        }

        console.log("Email sent successfully via Resend. ID:", response.data?.id);
    } catch (error) {
        console.error("Error sending email via Resend:", error);
        throw error;
    }
};

module.exports = { sendOTP };
