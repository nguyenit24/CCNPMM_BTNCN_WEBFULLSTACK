const Category = require('../models/category');
const Product = require('../models/product');
const { buildProductQuery, buildSortQuery, decorateProduct } = require('./catalog.shared');

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
        Product.findOne({ slug }).lean(),
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

module.exports = {
    getProductsService,
    getProductDetailService,
};