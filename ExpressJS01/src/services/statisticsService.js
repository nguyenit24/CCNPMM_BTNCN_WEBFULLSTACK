const Review = require('../models/review');
const { Order } = require('../models/order');
const Product = require('../models/product');

const createError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const getProductStatisticsService = async (productId) => {
    const product = await Product.findById(productId).select('views sold rating name').lean();
    if (!product) {
        throw createError(404, 'Sản phẩm không tồn tại');
    }

    const [reviewsCount, deliveredOrdersCount] = await Promise.all([
        Review.countDocuments({ productId }),
        Order.countDocuments({
            status: 'delivered',
            'items.productId': productId,
        }),
    ]);

    return {
        productId,
        productName: product.name,
        views: product.views || 0,
        sold: product.sold || 0,
        rating: product.rating || 0.0,
        totalReviews: reviewsCount,
        deliveredOrdersCount,
    };
};

module.exports = {
    getProductStatisticsService,
};
