const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true, index: true },
        badge: String,
        description: String,
        highlight: String,
        buttonLabel: String,
        banner: String,
        order: { type: Number, default: 0 },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Promotion = mongoose.model('promotion', promotionSchema);

module.exports = Promotion;