const {
    getCategoriesService,
    getCategoryDetailService,
    createCategoryService,
    updateCategoryService,
    deleteCategoryService,
} = require('../services/categoryService');

const getCategories = async (req, res) => {
    try {
        const data = await getCategoriesService();
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ' });
    }
};

const getCategoryDetail = async (req, res) => {
    try {
        const data = await getCategoryDetailService(req.params.slug);
        if (!data) {
            return res.status(404).json({ message: 'Category not found' });
        }
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ' });
    }
};

const createCategory = async (req, res) => {
    try {
        const data = await createCategoryService(req.body);
        return res.status(201).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

const updateCategory = async (req, res) => {
    try {
        const data = await updateCategoryService(req.params.slug, req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const data = await deleteCategoryService(req.params.slug);
        if (!data) {
            return res.status(404).json({ message: 'Category not found' });
        }
        return res.status(200).json({ deleted: true });
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

module.exports = {
    getCategories,
    getCategoryDetail,
    createCategory,
    updateCategory,
    deleteCategory,
};