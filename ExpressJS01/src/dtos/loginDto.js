const Joi = require('joi');

class LoginDto {
    constructor(data = {}) {
        // Map các field từ request body vào class properties
        this.email = data.email?.trim(); 
        this.password = data.password;
    }

    // Hàm tự validate chính nó
    validate() {
        // Định nghĩa Joi schema nội bộ
        const schema = Joi.object({
            email: Joi.string().email().required().messages({
                'string.email': 'Email không đúng định dạng',
                'any.required': 'Email là bắt buộc',
                'string.empty': 'Email không được để trống'
            }),
            password: Joi.string().min(6).required().messages({
                'string.min': 'Password phải từ 6 ký tự trở lên',
                'any.required': 'Password là bắt buộc',
                'string.empty': 'Password không được để trống'
            })
        });

        // Thực hiện validate object hiện tại (this)
        const { error, value } = schema.validate({
            email: this.email,
            password: this.password
        }, { abortEarly: false });

        if (error) {
            // Trả về mảng các câu báo lỗi nếu thất bại
            return {
                isValid: false,
                errors: error.details.map(detail => detail.message)
            };
        }

        // Trả về dữ liệu đã được làm sạch thành công
        return {
            isValid: true,
            data: value
        };
    }
}

module.exports = LoginDto;
