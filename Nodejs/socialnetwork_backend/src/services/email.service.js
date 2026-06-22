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
            htmlContent: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Account Verification</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f6f9fc;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 500px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            border: 1px solid #eef2f5;
        }
        .header {
            background-color: #1e88e5;
            padding: 30px;
            text-align: center;
            color: #ffffff;
        }
        .header img {
            width: 70px;
            height: 70px;
            margin-bottom: 10px;
            border-radius: 50%;
            background-color: #ffffff;
            padding: 8px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
            color: #333333;
        }
        .content p {
            font-size: 15px;
            line-height: 1.6;
            margin: 0 0 20px 0;
        }
        .otp-container {
            margin: 30px 0;
            background-color: #f1f8ff;
            border: 1px dashed #1e88e5;
            border-radius: 8px;
            padding: 15px;
            display: inline-block;
        }
        .otp-code {
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 4px;
            color: #1e88e5;
        }
        .footer {
            background-color: #fafbfc;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #777777;
            border-top: 1px solid #eef2f5;
        }
        .footer a {
            color: #1e88e5;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://socialnetwork-rkjz.onrender.com/logo.png" alt="Social Network Logo">
            <h1>Social Network</h1>
        </div>
        <div class="content">
            <p>Xin chào,</p>
            <p>Cảm ơn bạn đã lựa chọn tham gia mạng xã hội của chúng tôi. Dưới đây là mã xác thực tài khoản của bạn:</p>
            <div class="otp-container">
                <div class="otp-code">${otp}</div>
            </div>
            <p style="font-size: 13px; color: #666666;">Mã này chỉ có hiệu lực trong vòng <strong>1 phút</strong>. Vì lý do bảo mật, vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
        </div>
        <div class="footer">
            <p>Đây là email tự động, vui lòng không phản hồi lại email này.</p>
            <p>&copy; 2026 Social Network. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`
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
