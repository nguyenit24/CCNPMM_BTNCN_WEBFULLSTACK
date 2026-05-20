const Joi = require('joi');

class RegisterDto {
    constructor(data = {}) {
        this.name = data.name?.trim();
        this.email = data.email?.trim();
        this.password = data.password;
    }

    validate() {
        const schema = Joi.object({
            name: Joi.string().required().messages({
                'any.required': 'Họ tên là bắt buộc',
                'string.empty': 'Họ tên không được để trống'
            }),
            email: Joi.string().email().required().messages({
                'string.email': 'Email không đúng định dạng',
                'any.required': 'Email là bắt buộc',
                'string.empty': 'Email không được để trống'
            }),
            password: Joi.string().min(6).required().messages({
                'string.min': 'Mật khẩu phải từ 6 ký tự trở lên',
                'any.required': 'Mật khẩu là bắt buộc',
                'string.empty': 'Mật khẩu không được để trống'
            })
        });

        const { error, value } = schema.validate({
            name: this.name,
            email: this.email,
            password: this.password
        }, { abortEarly: false });

        if (error) {
            return {
                isValid: false,
                errors: error.details.map(detail => detail.message)
            };
        }

        return {
            isValid: true,
            data: value
        };
    }
}

module.exports = RegisterDto;
