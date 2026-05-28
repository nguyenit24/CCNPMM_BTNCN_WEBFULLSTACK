const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'order', required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true, index: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: '' },
        images: { type: [String], default: [] },
    },
    { timestamps: true }
);

// Prevent multiple reviews for the same product in a single order
reviewSchema.index({ orderId: 1, productId: 1 }, { unique: true });

const Review = mongoose.model('review', reviewSchema);

module.exports = Review;
