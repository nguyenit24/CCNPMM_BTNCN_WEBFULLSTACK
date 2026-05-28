const {
    addFavoriteService,
    removeFavoriteService,
    getMyFavoritesService,
} = require('../services/favoriteService');
const ApiResponse = require('../util/apiResponse');

const addFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json(ApiResponse(false, 'productId là bắt buộc', null));
        }

        const favorite = await addFavoriteService(userId, productId);
        return res.status(201).json(ApiResponse(true, 'Đã thêm sản phẩm vào danh sách yêu thích', favorite));
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json(ApiResponse(false, error.message || 'Đã xảy ra lỗi máy chủ', null));
    }
};

const removeFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        await removeFavoriteService(userId, productId);
        return res.status(200).json(ApiResponse(true, 'Đã xóa sản phẩm khỏi danh sách yêu thích', null));
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json(ApiResponse(false, error.message || 'Đã xảy ra lỗi máy chủ', null));
    }
};

const getMyFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await getMyFavoritesService(userId, req.query);
        return res.status(200).json(ApiResponse(true, 'Tải danh sách yêu thích thành công', data));
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json(ApiResponse(false, error.message || 'Đã xảy ra lỗi máy chủ', null));
    }
};

module.exports = {
    addFavorite,
    removeFavorite,
    getMyFavorites,
};
