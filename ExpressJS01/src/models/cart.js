const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
        quantity: { type: Number, required: true, default: 1, min: 1 },
    },
    { _id: false }
);

const cartSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, unique: true, index: true },
        items: { type: [cartItemSchema], default: [] },
    },
    { timestamps: true }
);

const Cart = mongoose.model('cart', cartSchema);

module.exports = Cart;