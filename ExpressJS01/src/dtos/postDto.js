const Joi = require('joi');

class PostDto {
    constructor(data = {}) {
        this.title = data.title?.trim();
        this.slug = data.slug?.trim();
        this.excerpt = data.excerpt?.trim();
        this.content = data.content?.trim();
        this.categorySlug = data.categorySlug?.trim();
        this.categoryName = data.categoryName?.trim();
        this.cover = data.cover?.trim();
        this.readTime = data.readTime?.trim();
        this.publishedAt = data.publishedAt;
        this.featured = data.featured;
        this.tags = data.tags;
    }

    validate() {
        const schema = Joi.object({
            title: Joi.string().required().messages({
                'any.required': 'Tiêu đề bài viết là bắt buộc',
                'string.empty': 'Tiêu đề bài viết không được để trống'
            }),
            slug: Joi.string().allow('', null).optional(),
            excerpt: Joi.string().allow('', null).optional(),
            content: Joi.string().allow('', null).optional(),
            categorySlug: Joi.string().allow('', null).optional(),
            categoryName: Joi.string().allow('', null).optional(),
            cover: Joi.string().allow('', null).optional(),
            readTime: Joi.string().allow('', null).optional(),
            publishedAt: Joi.string().allow('', null).optional(),
            featured: Joi.boolean().default(false).optional(),
            tags: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional()
        });

        const { error, value } = schema.validate({
            title: this.title,
            slug: this.slug,
            excerpt: this.excerpt,
            content: this.content,
            categorySlug: this.categorySlug,
            categoryName: this.categoryName,
            cover: this.cover,
            readTime: this.readTime,
            publishedAt: this.publishedAt,
            featured: this.featured,
            tags: this.tags
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

module.exports = PostDto;
