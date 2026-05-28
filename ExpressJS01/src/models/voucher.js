const mongoose = require('mongoose');

const VOUCHER_TYPES = ['percent_discount', 'free_shipping'];

const voucherSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true, index: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
        type: { type: String, enum: VOUCHER_TYPES, required: true },
        discountPercent: { type: Number, default: 0 }, // 10 = 10% off
        description: { type: String, default: '' },
        pointsCost: { type: Number, required: true, default: 100 },
        isUsed: { type: Boolean, default: false },
        usedAt: { type: Date },
        usedInOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'order' },
        expiresAt: { type: Date },
    },
    { timestamps: true }
);

const Voucher = mongoose.model('voucher', voucherSchema);

module.exports = { Voucher, VOUCHER_TYPES };
