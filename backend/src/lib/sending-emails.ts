import env from "@/env"
import Mailjet from "node-mailjet"

const mailjet = new Mailjet({
    apiKey: env.MAILJET_API_KEY,
    apiSecret: env.MAILJET_SECRET_KEY,
})

const sendVerifyEmail = async (email: string, name: string, verificationURL: string) => {
    const textPart = `
Hello ${name}!

Welcome to ${env.PROJECT_NAME}!

To complete your registration, please verify your email address by clicking the following link:

${verificationURL}

This link will be valid for 24 hours.

If you didn't create an account on our app, you can safely ignore this email.

Thank you!
${env.PROJECT_NAME} Team

---
This message was automatically generated, please do not reply to it.
    `.trim();

    const htmlPart = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .welcome-text {
            font-size: 18px;
            color: #2d3748;
            margin-bottom: 25px;
            font-weight: 500;
        }
        .message {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .info-box {
            background: linear-gradient(135deg, #e6fffa 0%, #f0fff4 100%);
            border-left: 4px solid #38b2ac;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
        }
        .info-box p {
            color: #2d3748;
            margin: 0;
            font-size: 14px;
        }
        .footer {
            background: #f7fafc;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            color: #718096;
            font-size: 14px;
            margin-bottom: 10px;
        }
        .footer .company-name {
            color: #667eea;
            font-weight: 600;
        }
        .security-notice {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .security-notice p {
            color: #c53030;
            font-size: 13px;
            margin: 0;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 12px;
            }
            .header, .content, .footer {
                padding: 25px 20px;
            }
            .header h1 {
                font-size: 24px;
            }
            .verify-button {
                padding: 14px 28px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Welcome!</h1>
            <p>${env.PROJECT_NAME} for Programming</p>
        </div>
        
        <div class="content">
            <div class="welcome-text">
                Hello ${name}! 👋
            </div>
            
            <div class="message">
                Thank you for joining!
                To complete your registration and begin your coding journey, 
                you need to verify your email address.
            </div>
            
            <div class="button-container">
                <a href="${verificationURL}" class="verify-button">
                    ✨ Verify Email Address
                </a>
            </div>
            
            <div class="info-box">
                <p>
                    <strong>💡 Important:</strong> This verification link will be valid for 1 hour. 
                    After verification, you'll be able to access all features of our app.
                </p>
            </div>
            
            <div class="security-notice">
                <p>
                    <strong>🔒 Security Note:</strong> If you didn't create an account on our app, 
                    you can safely ignore this email. Your data will not be used.
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p>Sent by: <span class="company-name">${env.PROJECT_NAME}</span></p>
            <p>This message was automatically generated, please do not reply to it.</p>
            <p style="margin-top: 15px; font-size: 12px;">
                © 2025 ${env.PROJECT_NAME}. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();

    const result = await mailjet.post("send", { version: "v3.1" })
        .request({
            Messages: [
                {
                    From: {
                        Email: env.EMAIL_FROM,
                        Name: env.EMAIL_FROM_NAME
                    },
                    To: [
                        {
                            Email: email,
                            Name: name
                        }
                    ],
                    Subject: `🚀 Verify your email address - ${env.PROJECT_NAME}`,
                    TextPart: textPart,
                    HTMLPart: htmlPart,
                }
            ]
        });

    return result;
}

export { sendVerifyEmail };