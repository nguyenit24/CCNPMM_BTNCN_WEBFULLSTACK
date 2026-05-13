const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true, index: true },
        excerpt: String,
        content: String,
        categorySlug: { type: String, default: 'news', index: true },
        categoryName: { type: String, default: 'News' },
        cover: String,
        readTime: { type: String, default: '3 min read' },
        publishedAt: { type: Date, default: Date.now },
        featured: { type: Boolean, default: false },
        tags: { type: [String], default: [] },
    },
    { timestamps: true }
);

const Post = mongoose.model('post', postSchema);

module.exports = Post;