const {
    getProductsService,
    getProductDetailService,
    createProductService,
    updateProductService,
    deleteProductService,
} = require('../services/productService');

const getProducts = async (req, res) => {
    try {
        const data = await getProductsService(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ' });
    }
};

const getProductDetail = async (req, res) => {
    try {
        const data = await getProductDetailService(req.params.slug);

        if (!data.product && data.emptyCollection) {
            return res.status(200).json(data);
        }

        if (!data.product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ' });
    }
};

const createProduct = async (req, res) => {
    try {
        const data = await createProductService(req.body);
        return res.status(201).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const data = await updateProductService(req.params.slug, req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const data = await deleteProductService(req.params.slug);
        if (!data) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        return res.status(200).json({ deleted: true });
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

module.exports = {
    getProducts,
    getProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
};