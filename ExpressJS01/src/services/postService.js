const Post = require('../models/post');
const { escapeRegex, normalizeList, slugify } = require('./catalog.shared');

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

const parseDate = (value) => {
    if (!value) {
        return undefined;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
};

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

const createPostService = async (payload = {}) => {
    const title = String(payload.title || '').trim();
    if (!title) {
        throw createError(400, 'Post title is required');
    }

    const slugSource = payload.slug ?? title;
    const slug = slugify(slugSource);
    if (!slug) {
        throw createError(400, 'Post slug is required');
    }

    const exists = await Post.findOne({ slug }).lean();
    if (exists) {
        throw createError(409, 'Post slug already exists');
    }

    const featuredValue = parseBoolean(payload.featured);
    const publishedAt = parseDate(payload.publishedAt);

    return Post.create({
        title,
        slug,
        excerpt: payload.excerpt,
        content: payload.content,
        categorySlug: payload.categorySlug || 'news',
        categoryName: payload.categoryName || 'News',
        cover: payload.cover,
        readTime: payload.readTime || '3 min read',
        publishedAt,
        featured: featuredValue === undefined ? false : featuredValue,
        tags: normalizeList(payload.tags),
    });
};

const updatePostService = async (slug, payload = {}) => {
    const post = await Post.findOne({ slug });
    if (!post) {
        throw createError(404, 'Post not found');
    }

    const update = {};

    if (payload.title !== undefined) {
        const title = String(payload.title || '').trim();
        if (!title) {
            throw createError(400, 'Post title is required');
        }
        update.title = title;
    }

    if (payload.slug !== undefined) {
        const nextSlug = slugify(payload.slug || '');
        if (!nextSlug) {
            throw createError(400, 'Post slug is required');
        }

        if (nextSlug !== slug) {
            const exists = await Post.findOne({ slug: nextSlug }).lean();
            if (exists) {
                throw createError(409, 'Post slug already exists');
            }
            update.slug = nextSlug;
        }
    }

    if (payload.excerpt !== undefined) {
        update.excerpt = payload.excerpt;
    }

    if (payload.content !== undefined) {
        update.content = payload.content;
    }

    if (payload.categorySlug !== undefined) {
        update.categorySlug = payload.categorySlug || 'news';
    }

    if (payload.categoryName !== undefined) {
        update.categoryName = payload.categoryName || 'News';
    }

    if (payload.cover !== undefined) {
        update.cover = payload.cover;
    }

    if (payload.readTime !== undefined) {
        update.readTime = payload.readTime || '3 min read';
    }

    if (payload.publishedAt !== undefined) {
        update.publishedAt = parseDate(payload.publishedAt) || post.publishedAt;
    }

    const featuredValue = parseBoolean(payload.featured);
    if (featuredValue !== undefined) {
        update.featured = featuredValue;
    }

    if (payload.tags !== undefined) {
        update.tags = normalizeList(payload.tags);
    }

    if (Object.keys(update).length === 0) {
        return post.toObject();
    }

    const updated = await Post.findOneAndUpdate({ slug }, update, {
        new: true,
        runValidators: true,
    });

    return updated.toObject();
};

const deletePostService = async (slug) => {
    return Post.findOneAndDelete({ slug }).lean();
};

module.exports = {
    getPostsService,
    getPostDetailService,
    createPostService,
    updatePostService,
    deletePostService,
};