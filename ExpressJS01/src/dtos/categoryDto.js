const Joi = require('joi');

class CategoryDto {
    constructor(data = {}) {
        this.name = data.name?.trim();
        this.slug = data.slug?.trim();
        this.description = data.description?.trim();
        this.image = data.image?.trim();
        this.order = data.order;
    }

    validate() {
        const schema = Joi.object({
            name: Joi.string().required().messages({
                'any.required': 'Tên danh mục là bắt buộc',
                'string.empty': 'Tên danh mục không được để trống'
            }),
            slug: Joi.string().allow('', null).optional(),
            description: Joi.string().allow('', null).optional(),
            image: Joi.string().allow('', null).optional(),
            order: Joi.number().integer().min(0).default(0).optional().messages({
                'number.min': 'Thứ tự ưu tiên không được âm'
            })
        });

        const { error, value } = schema.validate({
            name: this.name,
            slug: this.slug,
            description: this.description,
            image: this.image,
            order: this.order
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

module.exports = CategoryDto;
