const Review = require('../models/review');
const { Order } = require('../models/order');
const Product = require('../models/product');
const RewardPoint = require('../models/rewardPoint');
const RewardHistory = require('../models/rewardHistory');

const createError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const createReviewService = async (userId, payload = {}) => {
    const { productId, orderId, rating, comment, images } = payload;

    // 1. Fetch the order and perform security / business rules checks
    const mongoose = require('mongoose');
    let castOrderId, castUserId;
    try {
        castOrderId = new mongoose.Types.ObjectId(orderId);
        castUserId = new mongoose.Types.ObjectId(userId);
    } catch (e) {
        throw createError(400, 'Mã đơn hàng hoặc mã người dùng không đúng định dạng');
    }

    const order = await Order.findOne({ _id: castOrderId, userId: castUserId }).lean();
    if (!order) {
        throw createError(404, 'Đơn hàng không tồn tại hoặc không thuộc về bạn');
    }

    if (order.status !== 'delivered') {
        throw createError(400, 'Bạn chỉ được đánh giá sản phẩm của đơn hàng đã giao thành công');
    }

    // 2. Validate that the product exists inside this order items list
    const hasProduct = order.items.some(item => item.productId.toString() === productId);
    if (!hasProduct) {
        throw createError(400, 'Sản phẩm không thuộc đơn hàng này');
    }

    // 3. Prevent duplicate reviews (one review per product per order)
    const alreadyReviewed = await Review.findOne({ orderId, productId }).lean();
    if (alreadyReviewed) {
        throw createError(409, 'Sản phẩm này đã được bạn đánh giá trong đơn hàng này');
    }

    // 4. Create the new review record
    const review = await Review.create({
        userId,
        orderId,
        productId,
        rating,
        comment: comment || '',
        images: images || [],
    });

    // 5. Recalculate average rating of the product
    const allProductReviews = await Review.find({ productId }).lean();
    const count = allProductReviews.length;
    const totalRating = allProductReviews.reduce((sum, item) => sum + item.rating, 0);
    const avgRating = count > 0 ? Number((totalRating / count).toFixed(1)) : 0;

    await Product.findByIdAndUpdate(productId, { rating: avgRating });

    // 6. Allocate +10 reward loyalty points to user
    let userPoints = await RewardPoint.findOne({ userId });
    if (!userPoints) {
        userPoints = new RewardPoint({ userId, totalPoints: 0 });
    }
    userPoints.totalPoints += 10;
    await userPoints.save();

    // 7. Log reward history entry
    const productRecord = await Product.findById(productId).lean();
    const productName = productRecord ? productRecord.name : 'sản phẩm';
    await RewardHistory.create({
        userId,
        points: 10,
        reason: `Đánh giá sản phẩm "${productName}" (Đơn hàng: #${order.orderCode})`,
    });

    return review;
};

const getProductReviewsService = async (productId, query = {}) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        Review.find({ productId })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Review.countDocuments({ productId }),
    ]);

    return {
        items,
        total,
        page,
        limit,
    };
};

const updateReviewService = async (userId, reviewId, payload = {}) => {
    const review = await Review.findById(reviewId);
    if (!review) throw createError(404, 'Đánh giá không tồn tại');
    if (review.userId.toString() !== userId.toString()) throw createError(403, 'Bạn không có quyền chỉnh sửa đánh giá này');

    const { rating, comment, images } = payload;
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (images !== undefined) review.images = images;
    await review.save();

    // Recalculate product avg rating
    const allProductReviews = await Review.find({ productId: review.productId }).lean();
    const count = allProductReviews.length;
    const totalRating = allProductReviews.reduce((sum, item) => sum + item.rating, 0);
    const avgRating = count > 0 ? Number((totalRating / count).toFixed(1)) : 0;
    await Product.findByIdAndUpdate(review.productId, { rating: avgRating });

    return review;
};

const deleteReviewService = async (userId, reviewId) => {
    const review = await Review.findById(reviewId);
    if (!review) throw createError(404, 'Đánh giá không tồn tại');
    if (review.userId.toString() !== userId.toString()) throw createError(403, 'Bạn không có quyền xóa đánh giá này');

    const productId = review.productId;
    await review.deleteOne();

    // Recalculate product avg rating after deletion
    const allProductReviews = await Review.find({ productId }).lean();
    const count = allProductReviews.length;
    const totalRating = allProductReviews.reduce((sum, item) => sum + item.rating, 0);
    const avgRating = count > 0 ? Number((totalRating / count).toFixed(1)) : 0;
    await Product.findByIdAndUpdate(productId, { rating: avgRating });

    // Deduct the +10 reward points given when this review was created
    const userPoints = await RewardPoint.findOne({ userId });
    if (userPoints && userPoints.totalPoints >= 10) {
        userPoints.totalPoints -= 10;
        await userPoints.save();
        await RewardHistory.create({
            userId,
            points: -10,
            reason: `Xóa đánh giá sản phẩm (hoàn trả điểm trừ)`,
        });
    }

    return { success: true };
};

const getMyReviewsService = async (userId) => {
    const reviews = await Review.find({ userId })
        .populate('productId', 'name images slug')
        .sort({ createdAt: -1 })
        .lean();
    return reviews;
};

module.exports = {
    createReviewService,
    getProductReviewsService,
    updateReviewService,
    deleteReviewService,
    getMyReviewsService,
};
