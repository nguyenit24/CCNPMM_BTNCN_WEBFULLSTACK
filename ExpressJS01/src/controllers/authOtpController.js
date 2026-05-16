const {
    requestRegisterOtpService,
    verifyRegisterOtpService,
    requestForgotPasswordOtpService,
    resetPasswordWithOtpService,
} = require('../services/authOtpService');

const requestRegisterOtp = async (req, res) => {
    try {
        const data = await requestRegisterOtpService(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({
            EC: 1,
            EM: error.message || 'Đã xảy ra lỗi máy chủ',
        });
    }
};

const verifyRegisterOtp = async (req, res) => {
    try {
        const data = await verifyRegisterOtpService(req.body);
        return res.status(201).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({
            EC: 1,
            EM: error.message || 'Đã xảy ra lỗi máy chủ',
        });
    }
};

const requestForgotPasswordOtp = async (req, res) => {
    try {
        const data = await requestForgotPasswordOtpService(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({
            EC: 1,
            EM: error.message || 'Đã xảy ra lỗi máy chủ',
        });
    }
};

const resetPasswordWithOtp = async (req, res) => {
    try {
        const data = await resetPasswordWithOtpService(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({
            EC: 1,
            EM: error.message || 'Đã xảy ra lỗi máy chủ',
        });
    }
};

module.exports = {
    requestRegisterOtp,
    verifyRegisterOtp,
    requestForgotPasswordOtp,
    resetPasswordWithOtp,
};
