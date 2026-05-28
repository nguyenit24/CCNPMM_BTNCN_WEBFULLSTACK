const { Voucher } = require('../models/voucher');
const RewardPoint = require('../models/rewardPoint');
const RewardHistory = require('../models/rewardHistory');

const VOUCHER_OPTIONS = [
    {
        type: 'percent_discount',
        pointsCost: 100,
        discountPercent: 10,
        description: 'Giảm 10% tổng đơn hàng (tối đa 200.000đ)',
        label: 'Voucher giảm 10%',
        maxDiscount: 200000,
    },
    {
        type: 'free_shipping',
        pointsCost: 100,
        discountPercent: 0,
        description: 'Miễn phí vận chuyển cho đơn hàng tiếp theo',
        label: 'Voucher miễn phí ship',
        maxDiscount: 0,
    },
];

const createError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

/**
 * Redeem points for a voucher
 */
const redeemVoucherService = async (userId, voucherType) => {
    const option = VOUCHER_OPTIONS.find((o) => o.type === voucherType);
    if (!option) {
        throw createError(400, 'Loại voucher không hợp lệ. Chọn: percent_discount hoặc free_shipping');
    }

    // Check user points
    const pointsRecord = await RewardPoint.findOne({ userId });
    const currentPoints = pointsRecord ? pointsRecord.totalPoints : 0;
    if (currentPoints < option.pointsCost) {
        throw createError(400, `Bạn cần ${option.pointsCost} điểm để đổi voucher này. Bạn hiện có ${currentPoints} điểm.`);
    }

    // Generate unique code
    const code = `${voucherType === 'percent_discount' ? 'SALE' : 'SHIP'}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

    // Deduct points
    pointsRecord.totalPoints -= option.pointsCost;
    await pointsRecord.save();

    // Log reward history (negative deduction)
    await RewardHistory.create({
        userId,
        points: -option.pointsCost,
        reason: `Đổi điểm lấy voucher: ${option.label} (Mã: ${code})`,
    });

    // Create voucher with 30-day expiry
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const voucher = await Voucher.create({
        code,
        userId,
        type: option.type,
        discountPercent: option.discountPercent,
        description: option.description,
        pointsCost: option.pointsCost,
        expiresAt,
    });

    return { voucher, remainingPoints: pointsRecord.totalPoints };
};

/**
 * Get all vouchers for a user
 */
const getMyVouchersService = async (userId) => {
    const vouchers = await Voucher.find({ userId }).sort({ createdAt: -1 }).lean();
    return vouchers.map((v) => ({
        ...v,
        id: v._id.toString(),
        isExpired: v.expiresAt ? new Date(v.expiresAt) < new Date() : false,
    }));
};

/**
 * Validate and apply a voucher code at checkout (returns discount details)
 */
const validateVoucherService = async (userId, code, subtotal, shippingFee) => {
    if (!code) throw createError(400, 'Mã voucher không được để trống');

    const voucher = await Voucher.findOne({ code: String(code).trim().toUpperCase() });
    if (!voucher) throw createError(404, 'Mã voucher không tồn tại');
    if (voucher.userId.toString() !== userId.toString()) throw createError(403, 'Voucher này không thuộc về bạn');
    if (voucher.isUsed) throw createError(400, 'Voucher này đã được sử dụng');
    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) throw createError(400, 'Voucher đã hết hạn sử dụng');

    let discountAmount = 0;
    let shippingDiscount = 0;
    let discountLabel = '';

    if (voucher.type === 'percent_discount') {
        const option = VOUCHER_OPTIONS.find((o) => o.type === 'percent_discount');
        discountAmount = Math.min(Math.floor(subtotal * (voucher.discountPercent / 100)), option.maxDiscount);
        discountLabel = `Giảm ${voucher.discountPercent}% (−${discountAmount.toLocaleString('vi-VN')}đ)`;
    } else if (voucher.type === 'free_shipping') {
        shippingDiscount = shippingFee;
        discountLabel = `Miễn phí vận chuyển (−${shippingFee.toLocaleString('vi-VN')}đ)`;
    }

    return {
        voucherId: voucher._id.toString(),
        code: voucher.code,
        type: voucher.type,
        discountAmount,
        shippingDiscount,
        discountLabel,
        expiresAt: voucher.expiresAt,
    };
};

/**
 * Mark a voucher as used (called from orderService during checkout)
 */
const markVoucherUsedService = async (voucherId, orderId) => {
    await Voucher.findByIdAndUpdate(voucherId, {
        isUsed: true,
        usedAt: new Date(),
        usedInOrder: orderId,
    });
};

module.exports = {
    redeemVoucherService,
    getMyVouchersService,
    validateVoucherService,
    markVoucherUsedService,
    VOUCHER_OPTIONS,
};
