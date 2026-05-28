const { getProductStatisticsService } = require('../services/statisticsService');
const ApiResponse = require('../util/apiResponse');

const getProductStatistics = async (req, res) => {
    try {
        const { id } = req.params;
        const stats = await getProductStatisticsService(id);
        return res.status(200).json(ApiResponse(true, 'Tải thống kê sản phẩm thành công', stats));
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json(ApiResponse(false, error.message || 'Đã xảy ra lỗi máy chủ', null));
    }
};

module.exports = {
    getProductStatistics,
};
