const Category = require('../models/category');

const getCategoriesService = async () => {
    return Category.find({}).sort({ order: 1, name: 1 }).lean();
};

module.exports = {
    getCategoriesService,
};