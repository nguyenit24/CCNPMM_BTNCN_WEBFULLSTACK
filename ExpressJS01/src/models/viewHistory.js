const mongoose = require('mongoose');

const viewHistorySchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true, index: true },
        viewedAt: { type: Date, default: Date.now },
    }
);

// Fast indexing for fetching the user's latest viewed products
viewHistorySchema.index({ userId: 1, viewedAt: -1 });

const ViewHistory = mongoose.model('view_history', viewHistorySchema);

module.exports = ViewHistory;
