const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
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
        isDefault: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: { type: String, default: 'Member' },
    addresses: { type: [addressSchema], default: [] },
    refreshToken: { type: String, default: '' },
});

const User = mongoose.model('user', userSchema);

module.exports = User;