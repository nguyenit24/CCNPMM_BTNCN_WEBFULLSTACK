const mongoose = require('mongoose');

const rewardPointSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, unique: true, index: true },
        totalPoints: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true }
);

const RewardPoint = mongoose.model('reward_point', rewardPointSchema);

module.exports = RewardPoint;
