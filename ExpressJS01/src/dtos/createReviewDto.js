const Joi = require('joi');

class CreateReviewDto {
    constructor(data = {}) {
        this.productId = data.productId;
        this.orderId = data.orderId;
        this.rating = data.rating;
        this.comment = data.comment;
        this.images = data.images;
    }

    validate() {
        const schema = Joi.object({
            productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'productId không đúng định dạng ObjectId',
                'any.required': 'productId là bắt buộc',
                'string.empty': 'productId không được để trống'
            }),
            orderId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'orderId không đúng định dạng ObjectId',
                'any.required': 'orderId là bắt buộc',
                'string.empty': 'orderId không được để trống'
            }),
            rating: Joi.number().integer().min(1).max(5).required().messages({
                'number.base': 'Rating phải là một số',
                'number.integer': 'Rating phải là số nguyên',
                'number.min': 'Rating tối thiểu là 1',
                'number.max': 'Rating tối đa là 5',
                'any.required': 'Rating là bắt buộc'
            }),
            comment: Joi.string().allow('').optional().default(''),
            images: Joi.array().items(Joi.string().uri().allow('')).optional().default([])
        });

        const { error, value } = schema.validate({
            productId: this.productId,
            orderId: this.orderId,
            rating: this.rating,
            comment: this.comment,
            images: this.images
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

module.exports = CreateReviewDto;
