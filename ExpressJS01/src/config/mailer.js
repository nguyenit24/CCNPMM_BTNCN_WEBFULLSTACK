let Nodemailer = null;

try {
    Nodemailer = require('nodemailer');
} catch (error) {
    Nodemailer = null;
}

const createMailTransport = () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 0);
    const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!Nodemailer || !host || !port || !user || !pass) {
        return null;
    }

    return Nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user,
            pass,
        },
    });
};

const sendOtpMail = async ({ to, subject, otp, message }) => {
    const transport = createMailTransport();

    if (!transport) {
        return {
            sent: false,
            message: 'SMTP chưa được cấu hình, đang bỏ qua gửi mail',
        };
    }

    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    const appName = process.env.APP_NAME || 'TechStudio';
    const body = message || `Mã OTP của bạn là ${otp}. Mã này sẽ hết hạn sau vài phút.`;

    try {
        const info = await transport.sendMail({
            from: `${appName} <${from}>`,
            to,
            subject: subject || `${appName} OTP`,
            text: body,
            html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827"><h2 style="margin:0 0 12px">${appName}</h2><p style="margin:0 0 12px">${body}</p><div style="padding:14px 18px;border-radius:12px;background:#f3f4f6;font-size:22px;font-weight:700;letter-spacing:4px;text-align:center">${otp}</div></div>`,
        });

        return {
            sent: true,
            message: 'OTP email sent',
            info,
        };
    } catch (err) {
        console.error('Error sending OTP email:', err && err.message ? err.message : err);
        return {
            sent: false,
            message: err && err.message ? err.message : 'Gửi mail thất bại',
        };
    }
};

module.exports = {
    sendOtpMail,
};
