import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create a transporter for Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

// Send verification email
const sendVerificationEmail = async (email, code) => {
    try {
        const mailOptions = {
            from: '"Dot to Dot - SCU Connect" <dottodot.scu@gmail.com>',
            to: email,
            subject: 'SCU Connect 驗證碼',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #C8102E;">Dot to Dot - SCU Connect</h2>
                    <p>您好，</p>
                    <p>您的 SCU Connect 註冊驗證碼是：</p>
                    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #C8102E; margin: 20px 0; border-radius: 8px;">
                        ${code}
                    </div>
                    <p>此驗證碼將在 <strong>10 分鐘</strong> 後失效。</p>
                    <p>如果您沒有申請此驗證碼，請忽略此郵件。</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="color: #999; font-size: 12px;">此為系統自動發送的郵件，請勿直接回覆。</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
};

export { sendVerificationEmail };
