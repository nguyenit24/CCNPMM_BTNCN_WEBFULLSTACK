const Category = require('../models/category');
const Product = require('../models/product');
const {
    buildProductQuery,
    buildSortQuery,
    decorateProduct,
    normalizeList,
    slugify,
} = require('./catalog.shared');

const createError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const parseBoolean = (value) => {
    if (value === true || value === 'true' || value === '1') {
        return true;
    }
    if (value === false || value === 'false' || value === '0') {
        return false;
    }
    return undefined;
};

const parseNumber = (value) => {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? undefined : numberValue;
};

const normalizeStringArray = (value) => {
    if (value === undefined) {
        return undefined;
    }

    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    return normalizeList(value);
};

const getProductsService = async (filters = {}) => {
    const query = buildProductQuery(filters);
    const sort = buildSortQuery(filters.sort);
    const page = Math.max(Number(filters.page) || 1, 1);
    const limit = Math.min(Math.max(Number(filters.limit) || 12, 1), 24);
    const skip = (page - 1) * limit;

    const [items, total, categories, productCount] = await Promise.all([
        Product.find(query).sort(sort).skip(skip).limit(limit).lean(),
        Product.countDocuments(query),
        Category.find({}).sort({ order: 1, name: 1 }).lean(),
        Product.countDocuments({}),
    ]);

    return {
        items: items.map(decorateProduct),
        total,
        page,
        limit,
        categories,
        emptyCollection: productCount === 0,
    };
};

const getProductDetailService = async (slug) => {
    const [product, productCount] = await Promise.all([
        Product.findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { new: true }).lean(),
        Product.countDocuments({}),
    ]);

    if (!product) {
        return {
            product: null,
            category: null,
            similarProducts: [],
            emptyCollection: productCount === 0,
        };
    }

    const [categories, similarProducts] = await Promise.all([
        Category.find({}).sort({ order: 1, name: 1 }).lean(),
        Product.find({
            categorySlug: product.categorySlug,
            slug: { $ne: product.slug },
        })
            .sort({ bestSeller: -1, sold: -1, releasedAt: -1 })
            .limit(4)
            .lean(),
    ]);

    return {
        product: decorateProduct(product),
        category: categories.find((category) => category.slug === product.categorySlug) || null,
        similarProducts: similarProducts.map(decorateProduct),
        emptyCollection: productCount === 0,
    };
};

const getTopProductsService = async (filters = {}) => {
    const type = String(filters.type || '').trim();
    const page = Math.max(Number(filters.page) || 1, 1);
    const limit = Math.min(Math.max(Number(filters.limit) || 5, 1), 10);
    const skip = (page - 1) * limit;
    const topLimit = 10;

    const query = {};
    let sort = { sold: -1, rating: -1, releasedAt: -1 };

    if (type === 'bestSeller') {
        query.bestSeller = true;
        sort = { sold: -1, rating: -1, releasedAt: -1 };
    }

    if (type === 'mostViewed') {
        sort = { views: -1, sold: -1, rating: -1, releasedAt: -1 };
    }

    const totalRaw = await Product.countDocuments(query);
    const total = Math.min(totalRaw, topLimit);
    const cappedSkip = Math.min(skip, topLimit);
    const cappedLimit = Math.max(Math.min(limit, topLimit - cappedSkip), 0);

    const items = cappedLimit > 0
        ? await Product.find(query).sort(sort).skip(cappedSkip).limit(cappedLimit).lean()
        : [];

    return {
        items: items.map(decorateProduct),
        total,
        page,
        limit,
    };
};

const createProductService = async (payload = {}) => {
    const name = String(payload.name || '').trim();
    if (!name) {
        throw createError(400, 'Product name is required');
    }

    const slugSource = payload.slug ?? name;
    const slug = slugify(slugSource);
    if (!slug) {
        throw createError(400, 'Product slug is required');
    }

    const exists = await Product.findOne({ slug }).lean();
    if (exists) {
        throw createError(409, 'Product slug already exists');
    }

    const categorySlug = String(payload.categorySlug || '').trim();
    if (!categorySlug) {
        throw createError(400, 'Category slug is required');
    }

    let categoryName = String(payload.categoryName || '').trim();
    if (!categoryName) {
        const category = await Category.findOne({ slug: categorySlug }).lean();
        if (category) {
            categoryName = category.name;
        }
    }

    if (!categoryName) {
        throw createError(400, 'Category name is required');
    }

    const price = parseNumber(payload.price);
    if (price === undefined) {
        throw createError(400, 'Price is required');
    }

    const compareAtPrice = parseNumber(payload.compareAtPrice) || 0;
    const stock = parseNumber(payload.stock) || 0;
    const sold = parseNumber(payload.sold) || 0;
    const rating = parseNumber(payload.rating) || 0;

    const featuredValue = parseBoolean(payload.featured);
    const bestSellerValue = parseBoolean(payload.bestSeller);
    const isNewValue = parseBoolean(payload.isNew);
    const onSaleValue = parseBoolean(payload.onSale);

    const product = await Product.create({
        name,
        slug,
        categorySlug,
        categoryName,
        shortDescription: payload.shortDescription,
        description: payload.description,
        price,
        compareAtPrice,
        stock,
        sold,
        rating,
        images: normalizeStringArray(payload.images) || [],
        tags: normalizeStringArray(payload.tags) || [],
        specs: Array.isArray(payload.specs) ? payload.specs : [],
        featured: featuredValue === undefined ? false : featuredValue,
        bestSeller: bestSellerValue === undefined ? false : bestSellerValue,
        isNew: isNewValue === undefined ? false : isNewValue,
        onSale: onSaleValue === undefined ? compareAtPrice > price : onSaleValue,
        releasedAt: payload.releasedAt ? new Date(payload.releasedAt) : undefined,
    });

    return decorateProduct(product.toObject());
};

const updateProductService = async (slug, payload = {}) => {
    const product = await Product.findOne({ slug });
    if (!product) {
        throw createError(404, 'Product not found');
    }

    const update = {};

    if (payload.name !== undefined) {
        const name = String(payload.name || '').trim();
        if (!name) {
            throw createError(400, 'Product name is required');
        }
        update.name = name;
    }

    if (payload.slug !== undefined) {
        const nextSlug = slugify(payload.slug || '');
        if (!nextSlug) {
            throw createError(400, 'Product slug is required');
        }
        if (nextSlug !== slug) {
            const exists = await Product.findOne({ slug: nextSlug }).lean();
            if (exists) {
                throw createError(409, 'Product slug already exists');
            }
            update.slug = nextSlug;
        }
    }

    if (payload.categorySlug !== undefined) {
        const categorySlug = String(payload.categorySlug || '').trim();
        if (!categorySlug) {
            throw createError(400, 'Category slug is required');
        }
        update.categorySlug = categorySlug;
    }

    if (payload.categoryName !== undefined) {
        const categoryName = String(payload.categoryName || '').trim();
        if (!categoryName) {
            throw createError(400, 'Category name is required');
        }
        update.categoryName = categoryName;
    }

    if (update.categorySlug && !update.categoryName) {
        const category = await Category.findOne({ slug: update.categorySlug }).lean();
        if (category) {
            update.categoryName = category.name;
        }
    }

    if (update.categorySlug && !update.categoryName) {
        throw createError(400, 'Category name is required');
    }

    if (payload.shortDescription !== undefined) {
        update.shortDescription = payload.shortDescription;
    }

    if (payload.description !== undefined) {
        update.description = payload.description;
    }

    const price = parseNumber(payload.price);
    if (price !== undefined) {
        update.price = price;
    }

    const compareAtPrice = parseNumber(payload.compareAtPrice);
    if (compareAtPrice !== undefined) {
        update.compareAtPrice = compareAtPrice;
    }

    const stock = parseNumber(payload.stock);
    if (stock !== undefined) {
        update.stock = stock;
    }

    const sold = parseNumber(payload.sold);
    if (sold !== undefined) {
        update.sold = sold;
    }

    const rating = parseNumber(payload.rating);
    if (rating !== undefined) {
        update.rating = rating;
    }

    if (payload.images !== undefined) {
        update.images = normalizeStringArray(payload.images) || [];
    }

    if (payload.tags !== undefined) {
        update.tags = normalizeStringArray(payload.tags) || [];
    }

    if (payload.specs !== undefined) {
        update.specs = Array.isArray(payload.specs) ? payload.specs : [];
    }

    const featuredValue = parseBoolean(payload.featured);
    if (featuredValue !== undefined) {
        update.featured = featuredValue;
    }

    const bestSellerValue = parseBoolean(payload.bestSeller);
    if (bestSellerValue !== undefined) {
        update.bestSeller = bestSellerValue;
    }

    const isNewValue = parseBoolean(payload.isNew);
    if (isNewValue !== undefined) {
        update.isNew = isNewValue;
    }

    const onSaleValue = parseBoolean(payload.onSale);
    if (onSaleValue !== undefined) {
        update.onSale = onSaleValue;
    }

    if (payload.releasedAt !== undefined) {
        update.releasedAt = payload.releasedAt ? new Date(payload.releasedAt) : product.releasedAt;
    }

    if (Object.keys(update).length === 0) {
        return decorateProduct(product.toObject());
    }

    const updated = await Product.findOneAndUpdate({ slug }, update, {
        new: true,
        runValidators: true,
    });

    return decorateProduct(updated.toObject());
};

const deleteProductService = async (slug) => {
    return Product.findOneAndDelete({ slug }).lean();
};

module.exports = {
    getProductsService,
    getProductDetailService,
    getTopProductsService,
    createProductService,
    updateProductService,
    deleteProductService,
};