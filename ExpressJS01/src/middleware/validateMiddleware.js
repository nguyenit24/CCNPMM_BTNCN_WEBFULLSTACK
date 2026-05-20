const ApiResponse = require('../util/apiResponse');

const validateWithDto = (DtoClass) => {
    return (req, res, next) => {
        // 1. Khởi tạo instance từ Class DTO được truyền vào
        const dtoInstance = new DtoClass(req.body);

        // 2. Gọi hàm validate của instance đó
        const result = dtoInstance.validate();

        // 3. Nếu dữ liệu không hợp lệ, trả về lỗi 400
        if (!result.isValid) {
            const message = result.errors.join(', ');
            return res.status(400).json(ApiResponse(false, message, null));
        }

        // 4. Nếu hợp lệ, gán data đã qua xử lý ngược lại vào req.body và đi tiếp
        req.body = result.data;
        next();
    };
};

module.exports = validateWithDto;
