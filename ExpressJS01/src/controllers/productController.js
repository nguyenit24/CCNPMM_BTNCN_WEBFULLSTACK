const { getProductsService, getProductDetailService } = require('../services/productService');

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

module.exports = {
    getProducts,
    getProductDetail,
};