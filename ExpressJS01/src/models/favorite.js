const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true, index: true },
    },
    { timestamps: true }
);

// Prevent duplicate favorites for a user
favoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Favorite = mongoose.model('favorite', favoriteSchema);

module.exports = Favorite;
