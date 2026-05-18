const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true, index: true },
        categorySlug: { type: String, required: true, index: true },
        categoryName: { type: String, required: true },
        shortDescription: String,
        description: String,
        price: { type: Number, required: true },
        compareAtPrice: { type: Number, default: 0 },
        stock: { type: Number, default: 0 },
        sold: { type: Number, default: 0 },
        views: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        images: { type: [String], default: [] },
        tags: { type: [String], default: [] },
        specs: {
            type: [
                {
                    label: String,
                    value: String,
                },
            ],
            default: [],
        },
        featured: { type: Boolean, default: false },
        bestSeller: { type: Boolean, default: false },
        isNew: { type: Boolean, default: false },
        onSale: { type: Boolean, default: false },
        releasedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Product = mongoose.model('product', productSchema);

module.exports = Product;