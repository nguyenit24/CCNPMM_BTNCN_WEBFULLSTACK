const { sendOtpMail } = require('../config/mailer');

const sendTestEmail = async (req, res) => {
    try {
        const to = String(req.body.to || req.query.to || '').trim();
        if (!to) {
            return res.status(400).json({ EC: 1, EM: 'Thiếu địa chỉ email (param `to`)' });
        }

        const otp = req.body.otp || '000000';
        const result = await sendOtpMail({ to, otp, subject: 'Test SMTP', message: 'Đây là email kiểm tra SMTP' });

        return res.status(200).json({ EC: result.sent ? 0 : 1, EM: result.message, info: result.info || null });
    } catch (error) {
        console.error('sendTestEmail error', error);
        return res.status(500).json({ EC: 1, EM: error.message || 'Lỗi gửi mail' });
    }
};

module.exports = {
    sendTestEmail,
};
