const { redeemVoucherService, getMyVouchersService, validateVoucherService, VOUCHER_OPTIONS } = require('../services/voucherService');
const ApiResponse = require('../util/apiResponse');

const redeemVoucher = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type } = req.body;
        const result = await redeemVoucherService(userId, type);
        return res.status(201).json(ApiResponse(true, 'Đổi điểm lấy voucher thành công!', result));
    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json(ApiResponse(false, error.message || 'Lỗi máy chủ', null));
    }
};

const getMyVouchers = async (req, res) => {
    try {
        const userId = req.user.id;
        const vouchers = await getMyVouchersService(userId);
        return res.status(200).json(ApiResponse(true, 'Tải voucher thành công', vouchers));
    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json(ApiResponse(false, error.message || 'Lỗi máy chủ', null));
    }
};

const validateVoucher = async (req, res) => {
    try {
        const userId = req.user.id;
        const { code, subtotal, shippingFee } = req.body;
        const result = await validateVoucherService(userId, code, Number(subtotal || 0), Number(shippingFee || 0));
        return res.status(200).json(ApiResponse(true, 'Voucher hợp lệ', result));
    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json(ApiResponse(false, error.message || 'Lỗi máy chủ', null));
    }
};

const getVoucherOptions = async (req, res) => {
    return res.status(200).json(ApiResponse(true, 'Các loại voucher có thể đổi', VOUCHER_OPTIONS));
};

module.exports = { redeemVoucher, getMyVouchers, validateVoucher, getVoucherOptions };
