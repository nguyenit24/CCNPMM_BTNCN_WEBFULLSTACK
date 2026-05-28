const { createReviewService, getProductReviewsService, updateReviewService, deleteReviewService, getMyReviewsService } = require('../services/reviewService');
const RewardPoint = require('../models/rewardPoint');
const RewardHistory = require('../models/rewardHistory');
const ApiResponse = require('../util/apiResponse');

const createReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const review = await createReviewService(userId, req.body);
        return res.status(201).json(ApiResponse(true, 'Đánh giá sản phẩm thành công', review));
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json(ApiResponse(false, error.message || 'Đã xảy ra lỗi máy chủ', null));
    }
};

const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const data = await getProductReviewsService(productId, req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

const getMyRewards = async (req, res) => {
    try {
        const userId = req.user.id;

        const [pointsRecord, history] = await Promise.all([
            RewardPoint.findOne({ userId }).lean(),
            RewardHistory.find({ userId }).sort({ createdAt: -1 }).lean(),
        ]);

        return res.status(200).json(ApiResponse(true, 'Tải thông tin tích điểm thành công', {
            totalPoints: pointsRecord ? pointsRecord.totalPoints : 0,
            history: history || [],
        }));
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json(ApiResponse(false, error.message || 'Đã xảy ra lỗi máy chủ', null));
    }
};

const updateReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { reviewId } = req.params;
        const review = await updateReviewService(userId, reviewId, req.body);
        return res.status(200).json(ApiResponse(true, 'Cập nhật đánh giá thành công', review));
    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json(ApiResponse(false, error.message || 'Lỗi máy chủ', null));
    }
};

const deleteReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { reviewId } = req.params;
        await deleteReviewService(userId, reviewId);
        return res.status(200).json(ApiResponse(true, 'Xóa đánh giá thành công', null));
    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json(ApiResponse(false, error.message || 'Lỗi máy chủ', null));
    }
};

const getMyReviews = async (req, res) => {
    try {
        const userId = req.user.id;
        const reviews = await getMyReviewsService(userId);
        return res.status(200).json(ApiResponse(true, 'Tải đánh giá của bạn thành công', reviews));
    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json(ApiResponse(false, error.message || 'Lỗi máy chủ', null));
    }
};

module.exports = {
    createReview,
    getProductReviews,
    getMyRewards,
    updateReview,
    deleteReview,
    getMyReviews,
};
