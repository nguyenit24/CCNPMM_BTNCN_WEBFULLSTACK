const { getPromotionsService } = require('../services/promotionService');

const getPromotions = async (req, res) => {
    try {
        const data = await getPromotionsService();
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ' });
    }
};

module.exports = {
    getPromotions,
};