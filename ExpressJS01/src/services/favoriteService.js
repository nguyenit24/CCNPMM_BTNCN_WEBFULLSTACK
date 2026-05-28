const Favorite = require('../models/favorite');
const Product = require('../models/product');
const mongoose = require('mongoose');

const createError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const addFavoriteService = async (userId, productId) => {
    let castUserId, castProductId;
    try {
        castUserId = new mongoose.Types.ObjectId(userId);
        castProductId = new mongoose.Types.ObjectId(productId);
    } catch (e) {
        throw createError(400, 'Mã sản phẩm hoặc mã người dùng không đúng định dạng');
    }

    // Check if product exists
    const productExists = await Product.findById(castProductId).lean();
    if (!productExists) {
        throw createError(404, 'Sản phẩm không tồn tại');
    }

    // Try to create or find existing (compound unique index protects database, but we can do a nice upsert/find check)
    const existing = await Favorite.findOne({ userId: castUserId, productId: castProductId }).lean();
    if (existing) {
        return existing;
    }

    return Favorite.create({ userId: castUserId, productId: castProductId });
};

const removeFavoriteService = async (userId, productId) => {
    let castUserId, castProductId;
    try {
        castUserId = new mongoose.Types.ObjectId(userId);
        castProductId = new mongoose.Types.ObjectId(productId);
    } catch (e) {
        throw createError(400, 'Mã sản phẩm hoặc mã người dùng không đúng định dạng');
    }

    const deleted = await Favorite.findOneAndDelete({ userId: castUserId, productId: castProductId }).lean();
    if (!deleted) {
        throw createError(404, 'Sản phẩm chưa nằm trong danh sách yêu thích của bạn');
    }
    return deleted;
};

const getMyFavoritesService = async (userId, query = {}) => {
    let castUserId;
    try {
        castUserId = new mongoose.Types.ObjectId(userId);
    } catch (e) {
        throw createError(400, 'Mã người dùng không đúng định dạng');
    }

    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        Favorite.find({ userId: castUserId })
            .populate('productId') // Populates product info
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Favorite.countDocuments({ userId: castUserId }),
    ]);

    // Format output cleanly: filter out null products in case any product was deleted
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
    addFavoriteService,
    removeFavoriteService,
    getMyFavoritesService,
};
