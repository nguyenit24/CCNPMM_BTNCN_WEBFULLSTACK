const Joi = require('joi');

class PromotionDto {
    constructor(data = {}) {
        this.title = data.title?.trim();
        this.slug = data.slug?.trim();
        this.badge = data.badge?.trim();
        this.description = data.description?.trim();
        this.highlight = data.highlight?.trim();
        this.buttonLabel = data.buttonLabel?.trim();
        this.banner = data.banner?.trim();
        this.order = data.order;
        this.active = data.active;
    }

    validate() {
        const schema = Joi.object({
            title: Joi.string().required().messages({
                'any.required': 'Tiêu đề khuyến mãi là bắt buộc',
                'string.empty': 'Tiêu đề khuyến mãi không được để trống'
            }),
            slug: Joi.string().allow('', null).optional(),
            badge: Joi.string().allow('', null).optional(),
            description: Joi.string().allow('', null).optional(),
            highlight: Joi.string().allow('', null).optional(),
            buttonLabel: Joi.string().allow('', null).optional(),
            banner: Joi.string().allow('', null).optional(),
            order: Joi.number().integer().min(0).default(0).optional(),
            active: Joi.boolean().default(true).optional()
        });

        const { error, value } = schema.validate({
            title: this.title,
            slug: this.slug,
            badge: this.badge,
            description: this.description,
            highlight: this.highlight,
            buttonLabel: this.buttonLabel,
            banner: this.banner,
            order: this.order,
            active: this.active
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

module.exports = PromotionDto;
