const mongoose = require('mongoose');

const ORDER_STATUSES = ['new', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

const orderItemSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
        slug: { type: String, required: true },
        name: { type: String, required: true },
        image: { type: String, default: '' },
        categoryName: { type: String, default: '' },
        price: { type: Number, required: true, default: 0 },
        compareAtPrice: { type: Number, default: 0 },
        quantity: { type: Number, required: true, min: 1 },
        lineTotal: { type: Number, required: true, default: 0 },
    },
    { _id: false }
);

const orderAddressSchema = new mongoose.Schema(
    {
        label: { type: String, default: 'Địa chỉ' },
        recipientName: { type: String, required: true },
        phone: { type: String, required: true },
        line1: { type: String, required: true },
        ward: { type: String, default: '' },
        district: { type: String, default: '' },
        province: { type: String, default: '' },
        country: { type: String, default: 'Việt Nam' },
        detail: { type: String, default: '' },
        googleMapsLink: { type: String, default: '' },
        formattedAddress: { type: String, default: '' },
    },
    { _id: false }
);

const orderHistorySchema = new mongoose.Schema(
    {
        status: { type: String, enum: ORDER_STATUSES, required: true },
        note: { type: String, default: '' },
        actedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        actorRole: { type: String, default: 'Member' },
    },
    {
        _id: false,
        timestamps: { createdAt: true, updatedAt: false },
    }
);

const orderSchema = new mongoose.Schema(
    {
        orderCode: { type: String, required: true, unique: true, index: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
        customer: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
        },
        shippingAddress: { type: orderAddressSchema, required: true },
        items: { type: [orderItemSchema], default: [] },
        subtotal: { type: Number, required: true, default: 0 },
        shippingFee: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        voucherCode: { type: String, default: '' },
        total: { type: Number, required: true, default: 0 },
        paymentMethod: { type: String, enum: ['COD'], default: 'COD' },
        paymentStatus: { type: String, default: 'pending' },
        status: { type: String, enum: ORDER_STATUSES, default: 'new', index: true },
        statusHistory: { type: [orderHistorySchema], default: [] },
        cancellation: {
            requestStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
            requestedAt: { type: Date },
            requestedReason: { type: String, default: '' },
            reviewedAt: { type: Date },
            reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        },
        notes: { type: String, default: '' },
        confirmedAt: { type: Date },
        preparingAt: { type: Date },
        shippedAt: { type: Date },
        deliveredAt: { type: Date },
        cancelledAt: { type: Date },
        autoConfirmAt: { type: Date },
    },
    { timestamps: true }
);

const Order = mongoose.model('order', orderSchema);

module.exports = {
    Order,
    ORDER_STATUSES,
};