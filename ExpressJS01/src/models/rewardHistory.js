const mongoose = require('mongoose');

const rewardHistorySchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
        points: { type: Number, required: true }, // positive for earned, negative for spent
        reason: { type: String, required: true }, // e.g. "Đánh giá sản phẩm Bàn phím cơ..."
    },
    { timestamps: true }
);

const RewardHistory = mongoose.model('reward_history', rewardHistorySchema);

module.exports = RewardHistory;
