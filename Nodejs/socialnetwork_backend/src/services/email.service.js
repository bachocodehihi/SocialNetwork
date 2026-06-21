const https = require('https');

const sendOTP = (email, otp) => {
    return new Promise((resolve, reject) => {
        // Chuẩn bị dữ liệu gửi cho Brevo
        const data = JSON.stringify({
            sender: {
                name: 'Social Network',
                email: 'quybach2611@gmail.com'
            },
            to: [
                {
                    email: email
                }
            ],
            subject: 'Account Verification',
            htmlContent: `<h3>Hello!</h3>
                           <p>Your account verification code is: <strong>${otp}</strong></p>
                           <p>This code is valid for 1 minute. For security reasons, please do not share this code with others.</p>`
        });

        // Cấu hình HTTP Request đến Brevo API (port 443 không bị Render chặn)
        const options = {
            hostname: 'api.brevo.com',
            port: 443,
            path: '/v3/smtp/email',
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json',
                'content-length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`Email sent successfully via Brevo to ${email}. ID: ${body}`);
                    resolve(JSON.parse(body));
                } else {
                    console.error(`Brevo API returned error status ${res.statusCode}: ${body}`);
                    reject(new Error(`Brevo API error: ${body}`));
                }
            });
        });

        req.on('error', (error) => {
            console.error("Error making request to Brevo:", error);
            reject(error);
        });

        req.write(data);
        req.end();
    });
};

module.exports = { sendOTP };
