const { getCategoriesService } = require('./categoryService');
const { getPromotionsService } = require('./promotionService');
const { getProductsService } = require('./productService');
const { getPostsService } = require('./postService');
const Category = require('../models/category');
const Promotion = require('../models/promotion');
const Product = require('../models/product');
const Post = require('../models/post');

const getHomeService = async (member = null) => {
    const [
        categories,
        promotions,
        newestProducts,
        bestSellerProducts,
        featuredProducts,
        latestPosts,
        categoryCount,
        promotionCount,
        productCount,
        postCount,
    ] = await Promise.all([
        getCategoriesService(),
        getPromotionsService(),
        getProductsService({ isNew: true, sort: 'newest', limit: 4 }),
        getProductsService({ bestSeller: true, sort: 'popular', limit: 5 }),
        getProductsService({ featured: true, sort: 'featured', limit: 4 }),
        getPostsService({ featured: true, sort: 'newest', limit: 3 }),
        Category.countDocuments({}),
        Promotion.countDocuments({}),
        Product.countDocuments({}),
        Post.countDocuments({}),
    ]);

    return {
        member,
        heroPromotion: promotions[0] || null,
        categories,
        promotions,
        newestProducts: newestProducts.items,
        bestSellerProducts: bestSellerProducts.items,
        featuredProducts: featuredProducts.items,
        latestPosts: latestPosts.items,
        emptyStore: categoryCount === 0 && promotionCount === 0 && productCount === 0 && postCount === 0,
    };
};

module.exports = {
    getHomeService,
};