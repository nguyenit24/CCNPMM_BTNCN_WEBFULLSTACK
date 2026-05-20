const Joi = require('joi');

class ProductDto {
    constructor(data = {}) {
        this.name = data.name?.trim();
        this.slug = data.slug?.trim();
        this.categorySlug = data.categorySlug?.trim();
        this.categoryName = data.categoryName?.trim();
        this.price = data.price;
        this.compareAtPrice = data.compareAtPrice;
        this.stock = data.stock;
        this.sold = data.sold;
        this.rating = data.rating;
        this.releasedAt = data.releasedAt;
        this.shortDescription = data.shortDescription?.trim();
        this.description = data.description?.trim();
        this.tags = data.tags;
        this.images = data.images;
        this.specs = data.specs;
        this.featured = data.featured;
        this.bestSeller = data.bestSeller;
        this.isNew = data.isNew;
        this.onSale = data.onSale;
    }

    validate() {
        const schema = Joi.object({
            name: Joi.string().required().messages({
                'any.required': 'Tên sản phẩm là bắt buộc',
                'string.empty': 'Tên sản phẩm không được để trống'
            }),
            slug: Joi.string().allow('', null).optional(),
            categorySlug: Joi.string().required().messages({
                'any.required': 'Đường dẫn danh mục (categorySlug) là bắt buộc',
                'string.empty': 'Đường dẫn danh mục không được để trống'
            }),
            categoryName: Joi.string().allow('', null).optional(),
            price: Joi.number().min(0).required().messages({
                'any.required': 'Giá sản phẩm là bắt buộc',
                'number.min': 'Giá sản phẩm không được âm'
            }),
            compareAtPrice: Joi.number().min(0).allow(null).optional(),
            stock: Joi.number().integer().min(0).allow(null).optional(),
            sold: Joi.number().integer().min(0).allow(null).optional(),
            rating: Joi.number().min(0).max(5).allow(null).optional(),
            releasedAt: Joi.string().allow('', null).optional(),
            shortDescription: Joi.string().allow('', null).optional(),
            description: Joi.string().allow('', null).optional(),
            tags: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
            images: Joi.array().items(Joi.string()).optional(),
            specs: Joi.array().items(Joi.object({
                label: Joi.string().allow('').optional(),
                value: Joi.string().allow('').optional()
            })).optional(),
            featured: Joi.boolean().optional(),
            bestSeller: Joi.boolean().optional(),
            isNew: Joi.boolean().optional(),
            onSale: Joi.boolean().optional()
        });

        const { error, value } = schema.validate({
            name: this.name,
            slug: this.slug,
            categorySlug: this.categorySlug,
            categoryName: this.categoryName,
            price: this.price,
            compareAtPrice: this.compareAtPrice,
            stock: this.stock,
            sold: this.sold,
            rating: this.rating,
            releasedAt: this.releasedAt,
            shortDescription: this.shortDescription,
            description: this.description,
            tags: this.tags,
            images: this.images,
            specs: this.specs,
            featured: this.featured,
            bestSeller: this.bestSeller,
            isNew: this.isNew,
            onSale: this.onSale
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

module.exports = ProductDto;
