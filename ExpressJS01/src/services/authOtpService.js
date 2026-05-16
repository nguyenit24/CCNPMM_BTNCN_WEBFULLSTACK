const bcrypt = require('bcrypt');
const User = require('../models/user');
const { createRedisClient, checkRedisConnection } = require('../config/redis');
const { sendOtpMail } = require('../config/mailer');

const redis = createRedisClient();
const OTP_TTL_SECONDS = 300;

const createError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const registerOtpKey = (email) => `auth:register:otp:${normalizeEmail(email)}`;
const registerUserKey = (email) => `auth:register:user:${normalizeEmail(email)}`;
const forgotOtpKey = (email) => `auth:forgot:otp:${normalizeEmail(email)}`;

const storeJson = async (key, value, ttlSeconds = OTP_TTL_SECONDS) => {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
};

const readJson = async (key) => {
    const raw = await redis.get(key);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch (error) {
        return null;
    }
};

const removeKeys = async (keys = []) => {
    await Promise.all(keys.map((key) => redis.del(key)));
};

const getRedisHealth = async () => {
    return checkRedisConnection();
};

const requestRegisterOtpService = async (payload = {}) => {
    const name = String(payload.name || '').trim();
    const email = normalizeEmail(payload.email);
    const password = String(payload.password || '').trim();

    if (!name) {
        throw createError(400, 'Name is required');
    }
    if (!email) {
        throw createError(400, 'Email is required');
    }
    if (!password) {
        throw createError(400, 'Password is required');
    }

    const exists = await User.findOne({ email }).lean();
    if (exists) {
        throw createError(409, 'Email already exists');
    }

    const otp = generateOtp();
    const passwordHash = await bcrypt.hash(password, 10);
    const tempUser = {
        name,
        email,
        passwordHash,
        role: 'Member',
    };

    await Promise.all([
        storeJson(registerOtpKey(email), { otp, email }, OTP_TTL_SECONDS),
        storeJson(registerUserKey(email), tempUser, OTP_TTL_SECONDS),
    ]);

    const mailResult = await sendOtpMail({
        to: email,
        subject: 'TechStudio - OTP đăng ký',
        otp,
        message: 'Mã OTP đăng ký TechStudio của bạn là',
    });

    return {
        EC: 0,
        EM: mailResult.sent ? 'OTP đã được gửi đến email của bạn' : 'OTP đã được tạo và lưu tạm trên hệ thống',
        email,
        expiresIn: OTP_TTL_SECONDS,
    };
};

const verifyRegisterOtpService = async (payload = {}) => {
    const email = normalizeEmail(payload.email);
    const otp = String(payload.otp || '').trim();

    if (!email) {
        throw createError(400, 'Email is required');
    }
    if (!otp) {
        throw createError(400, 'OTP is required');
    }

    const [otpRecord, tempUser] = await Promise.all([
        readJson(registerOtpKey(email)),
        readJson(registerUserKey(email)),
    ]);

    if (!otpRecord || !tempUser) {
        throw createError(404, 'OTP đã hết hạn hoặc không tồn tại');
    }

    if (String(otpRecord.otp) !== otp) {
        throw createError(400, 'OTP không chính xác');
    }

    const exists = await User.findOne({ email }).lean();
    if (exists) {
        await removeKeys([registerOtpKey(email), registerUserKey(email)]);
        throw createError(409, 'Email already exists');
    }

    const user = await User.create({
        name: tempUser.name,
        email: tempUser.email,
        password: tempUser.passwordHash,
        role: tempUser.role || 'Member',
    });

    await removeKeys([registerOtpKey(email), registerUserKey(email)]);

    const result = user.toObject();
    delete result.password;

    return {
        EC: 0,
        EM: 'Đăng ký thành công',
        user: result,
    };
};

const requestForgotPasswordOtpService = async (payload = {}) => {
    const email = normalizeEmail(payload.email);
    if (!email) {
        throw createError(400, 'Email is required');
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
        // Do not reveal whether the email exists to avoid user enumeration.
        // Return a generic success response so the frontend proceeds the same way.
        return {
            EC: 0,
            EM: 'Nếu email tồn tại trong hệ thống, OTP sẽ được gửi đến email đó',
            email,
            expiresIn: OTP_TTL_SECONDS,
        };
    }

    const otp = generateOtp();
    await storeJson(forgotOtpKey(email), { otp, email }, OTP_TTL_SECONDS);

    const mailResult = await sendOtpMail({
        to: email,
        subject: 'TechStudio - OTP khôi phục mật khẩu',
        otp,
        message: 'Mã OTP khôi phục mật khẩu TechStudio của bạn là',
    });

    if (!mailResult.sent) {
        console.warn(`Failed to send forgot-password OTP to ${email}: ${mailResult.message}`);
    }

    return {
        EC: 0,
        EM: mailResult.sent ? 'OTP đã được gửi đến email của bạn' : 'OTP đã được tạo và lưu tạm trên hệ thống',
        email,
        expiresIn: OTP_TTL_SECONDS,
    };
};

const resetPasswordWithOtpService = async (payload = {}) => {
    const email = normalizeEmail(payload.email);
    const otp = String(payload.otp || '').trim();
    const password = String(payload.password || '').trim();

    if (!email) {
        throw createError(400, 'Email is required');
    }
    if (!otp) {
        throw createError(400, 'OTP is required');
    }
    if (!password) {
        throw createError(400, 'Password is required');
    }

    const otpRecord = await readJson(forgotOtpKey(email));
    if (!otpRecord) {
        throw createError(404, 'OTP đã hết hạn hoặc không tồn tại');
    }

    if (String(otpRecord.otp) !== otp) {
        throw createError(400, 'OTP không chính xác');
    }

    const user = await User.findOne({ email });
    if (!user) {
        await redis.del(forgotOtpKey(email));
        throw createError(404, 'Email không tồn tại trong hệ thống');
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    await redis.del(forgotOtpKey(email));

    return {
        EC: 0,
        EM: 'Đặt lại mật khẩu thành công',
    };
};

module.exports = {
    requestRegisterOtpService,
    verifyRegisterOtpService,
    requestForgotPasswordOtpService,
    resetPasswordWithOtpService,
    getRedisHealth,
};
