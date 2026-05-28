const {
    addViewHistoryService,
    getMyViewHistoryService,
} = require('../services/viewHistoryService');
const ApiResponse = require('../util/apiResponse');

const addViewHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const history = await addViewHistoryService(userId, productId);
        return res.status(200).json(ApiResponse(true, 'Đã ghi nhận lịch sử xem sản phẩm', history));
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json(ApiResponse(false, error.message || 'Đã xảy ra lỗi máy chủ', null));
    }
};

const getMyViewHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await getMyViewHistoryService(userId, req.query);
        return res.status(200).json(ApiResponse(true, 'Tải lịch sử xem sản phẩm thành công', data));
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json(ApiResponse(false, error.message || 'Đã xảy ra lỗi máy chủ', null));
    }
};

module.exports = {
    addViewHistory,
    getMyViewHistory,
};
