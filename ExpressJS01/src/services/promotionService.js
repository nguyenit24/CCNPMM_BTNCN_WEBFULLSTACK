const Promotion = require('../models/promotion');

const getPromotionsService = async () => {
    return Promotion.find({ active: true }).sort({ order: 1 }).lean();
};

module.exports = {
    getPromotionsService,
};