const {
    checkoutOrderService,
    listOrdersService,
    getOrderDetailService,
    cancelOrderService,
    updateOrderStatusService,
} = require('../services/orderService');

const getOrders = async (req, res) => {
    try {
        const data = await listOrdersService(req.user);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

const getOrderDetail = async (req, res) => {
    try {
        const data = await getOrderDetailService(req.user, req.params.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

const checkoutOrder = async (req, res) => {
    try {
        const data = await checkoutOrderService(req.user.id, req.body);
        return res.status(201).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const data = await cancelOrderService(req.user, req.params.id, req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const data = await updateOrderStatusService(req.user, req.params.id, req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Đã xảy ra lỗi máy chủ' });
    }
};

module.exports = {
    getOrders,
    getOrderDetail,
    checkoutOrder,
    cancelOrder,
    updateOrderStatus,
};