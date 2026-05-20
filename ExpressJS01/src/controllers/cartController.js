const {
    getCartService,
    addCartItemService,
    updateCartItemService,
    removeCartItemService,
    clearCartService,
} = require('../services/cartService');

const getCart = async (req, res) => {
    try {
        const data = await getCartService(req.user.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

const addCartItem = async (req, res) => {
    try {
        const data = await addCartItemService(req.user.id, req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const data = await updateCartItemService(req.user.id, req.params.slug, req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

const removeCartItem = async (req, res) => {
    try {
        const data = await removeCartItemService(req.user.id, req.params.slug);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

const clearCart = async (req, res) => {
    try {
        const data = await clearCartService(req.user.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

module.exports = {
    getCart,
    addCartItem,
    updateCartItem,
    removeCartItem,
    clearCart,
};