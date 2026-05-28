const ViewHistory = require('../models/viewHistory');
const Product = require('../models/product');

const createError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const addViewHistoryService = async (userId, productId) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw createError(404, 'Sản phẩm không tồn tại');
    }

    // Upsert view history: update viewedAt if exists, or create new one.
    // This keeps one record per user-product combo and bubbles it to the top.
    const history = await ViewHistory.findOneAndUpdate(
        { userId, productId },
        { viewedAt: new Date() },
        { new: true, upsert: true }
    );

    // Increment product views count
    product.views = (product.views || 0) + 1;
    await product.save();

    return history;
};

const getMyViewHistoryService = async (userId, query = {}) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        ViewHistory.find({ userId })
            .populate('productId')
            .sort({ viewedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        ViewHistory.countDocuments({ userId }),
    ]);

    // Format output: filter out null products in case any product was deleted
    const filteredItems = items
        .filter(item => item.productId !== null)
        .map(item => item.productId);

    return {
        items: filteredItems,
        total,
        page,
        limit,
    };
};

module.exports = {
    addViewHistoryService,
    getMyViewHistoryService,
};
