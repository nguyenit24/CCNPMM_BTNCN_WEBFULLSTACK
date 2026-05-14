const {
    getPromotionsService,
    getPromotionDetailService,
    createPromotionService,
    updatePromotionService,
    deletePromotionService,
} = require('../services/promotionService');

const getPromotions = async (req, res) => {
    try {
        const data = await getPromotionsService();
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ' });
    }
};

const getPromotionDetail = async (req, res) => {
    try {
        const data = await getPromotionDetailService(req.params.slug);
        if (!data) {
            return res.status(404).json({ message: 'Promotion not found' });
        }
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ' });
    }
};

const createPromotion = async (req, res) => {
    try {
        const data = await createPromotionService(req.body);
        return res.status(201).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

const updatePromotion = async (req, res) => {
    try {
        const data = await updatePromotionService(req.params.slug, req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

const deletePromotion = async (req, res) => {
    try {
        const data = await deletePromotionService(req.params.slug);
        if (!data) {
            return res.status(404).json({ message: 'Promotion not found' });
        }
        return res.status(200).json({ deleted: true });
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

module.exports = {
    getPromotions,
    getPromotionDetail,
    createPromotion,
    updatePromotion,
    deletePromotion,
};