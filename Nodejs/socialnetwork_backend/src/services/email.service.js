const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTP = async (email, otp) => {
    try {
        // Mẹo test nhiều tài khoản:
        // Vì Resend Free chỉ cho gửi tới quybach2611@gmail.com, 
        // đối với bất kỳ email nào khác, chúng ta sẽ ghi mã OTP ra log của Render 
        // để bạn có thể mở log lên xem và nhập test thoải mái mà không bị báo lỗi.
        if (email !== 'quybach2611@gmail.com') {
            console.log(`=========================================`);
            console.log(`[TESTING OTP] Email: ${email} | Code: ${otp}`);
            console.log(`=========================================`);
            return;
        }

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
