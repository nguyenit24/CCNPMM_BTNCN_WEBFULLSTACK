const Category = require('../models/category');
const Product = require('../models/product');
const Post = require('../models/post');
const { slugify } = require('./catalog.shared');

const createError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const getCategoriesService = async (filters = {}) => {
    const pageProvided = filters.page !== undefined || filters.limit !== undefined;

    if (!pageProvided) {
        return Category.find({}).sort({ order: 1, name: 1 }).lean();
    }

    const page = Math.max(Number(filters.page) || 1, 1);
    const limit = Math.min(Math.max(Number(filters.limit) || 12, 1), 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        Category.find({}).sort({ order: 1, name: 1 }).skip(skip).limit(limit).lean(),
        Category.countDocuments({}),
    ]);

    return {
        items,
        total,
        page,
        limit,
    };
};

const getCategoryDetailService = async (slug) => {
    return Category.findOne({ slug }).lean();
};

const createCategoryService = async (payload = {}) => {
    const name = String(payload.name || '').trim();
    if (!name) {
        throw createError(400, 'Category name is required');
    }

    const slugSource = payload.slug ?? name;
    const slug = slugify(slugSource);
    if (!slug) {
        throw createError(400, 'Category slug is required');
    }

    const exists = await Category.findOne({ slug }).lean();
    if (exists) {
        throw createError(409, 'Category slug already exists');
    }

    return Category.create({
        name,
        slug,
        description: payload.description,
        image: payload.image,
        order: payload.order ?? 0,
    });
};

const updateCategoryService = async (slug, payload = {}) => {
    const category = await Category.findOne({ slug });
    if (!category) {
        throw createError(404, 'Category not found');
    }

    const update = {};

    if (payload.name !== undefined) {
        const name = String(payload.name || '').trim();
        if (!name) {
            throw createError(400, 'Category name is required');
        }
        update.name = name;
    }

    if (payload.slug !== undefined) {
        const nextSlug = slugify(payload.slug || '');
        if (!nextSlug) {
            throw createError(400, 'Category slug is required');
        }

        if (nextSlug !== slug) {
            const exists = await Category.findOne({ slug: nextSlug }).lean();
            if (exists) {
                throw createError(409, 'Category slug already exists');
            }
            update.slug = nextSlug;
        }
    }

    if (payload.description !== undefined) {
        update.description = payload.description;
    }

    if (payload.image !== undefined) {
        update.image = payload.image;
    }

    if (payload.order !== undefined) {
        update.order = Number(payload.order) || 0;
    }

    if (Object.keys(update).length === 0) {
        return category.toObject();
    }

    const updated = await Category.findOneAndUpdate({ slug }, update, {
        new: true,
        runValidators: true,
    });

    if (update.slug || update.name) {
        const nextSlug = update.slug || slug;
        const nextName = update.name || category.name;

        await Promise.all([
            Product.updateMany({ categorySlug: slug }, { $set: { categorySlug: nextSlug, categoryName: nextName } }),
            Post.updateMany({ categorySlug: slug }, { $set: { categorySlug: nextSlug, categoryName: nextName } }),
        ]);
    }

    return updated.toObject();
};

const deleteCategoryService = async (slug) => {
    return Category.findOneAndDelete({ slug }).lean();
};

module.exports = {
    getCategoriesService,
    getCategoryDetailService,
    createCategoryService,
    updateCategoryService,
    deleteCategoryService,
};