const Post = require('../models/post');
const { escapeRegex, normalizeList } = require('./catalog.shared');

const buildPostQuery = (filters = {}) => {
    const query = {};
    const keyword = String(filters.q || filters.search || '').trim();

    if (keyword) {
        const regex = new RegExp(escapeRegex(keyword), 'i');
        query.$or = [
            { title: regex },
            { excerpt: regex },
            { content: regex },
            { tags: regex },
        ];
    }

    const categories = normalizeList(filters.category || filters.categories);
    if (categories.length > 0) {
        query.categorySlug = { $in: categories };
    }

    const featuredValue = filters.featured;
    if (featuredValue === true || featuredValue === 'true' || featuredValue === '1') {
        query.featured = true;
    }

    return query;
};

const getPostsService = async (filters = {}) => {
    const query = buildPostQuery(filters);
    const page = Math.max(Number(filters.page) || 1, 1);
    const limit = Math.min(Math.max(Number(filters.limit) || 12, 1), 24);
    const skip = (page - 1) * limit;
    const sort = filters.sort === 'oldest' ? { publishedAt: 1 } : { publishedAt: -1 };

    const [items, total, postCount] = await Promise.all([
        Post.find(query).sort(sort).skip(skip).limit(limit).lean(),
        Post.countDocuments(query),
        Post.countDocuments({}),
    ]);

    return {
        items,
        total,
        page,
        limit,
        emptyCollection: postCount === 0,
    };
};

const getPostDetailService = async (slug) => {
    const [post, postCount] = await Promise.all([
        Post.findOne({ slug }).lean(),
        Post.countDocuments({}),
    ]);

    if (!post) {
        return {
            post: null,
            relatedPosts: [],
            emptyCollection: postCount === 0,
        };
    }

    const relatedPosts = await Post.find({
        slug: { $ne: post.slug },
        categorySlug: post.categorySlug,
    })
        .sort({ publishedAt: -1 })
        .limit(3)
        .lean();

    return {
        post,
        relatedPosts,
        emptyCollection: postCount === 0,
    };
};

module.exports = {
    getPostsService,
    getPostDetailService,
};