require('dotenv').config();
const mongoose = require('mongoose');
const { Order, ORDER_STATUSES } = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');
const User = require('../models/user');

const createError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const ORDER_STATUS_META = {
    new: { label: 'Đơn hàng mới', color: 'gold' },
    confirmed: { label: 'Đã xác nhận đơn hàng', color: 'blue' },
    preparing: { label: 'Shop đang chuẩn bị hàng', color: 'orange' },
    shipped: { label: 'Đang giao hàng', color: 'processing' },
    delivered: { label: 'Đã giao thành công', color: 'green' },
    cancelled: { label: 'Hủy đơn hàng', color: 'red' },
};

const ORDER_STATUS_SEQUENCE = ['new', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

const normalizeText = (value, fallback = '') => String(value ?? fallback).trim();

const formatAddress = (address = {}) => {
    const parts = [
        address.line1,
        address.detail,
        address.ward,
        address.district,
        address.province,
        address.country,
    ]
        .map((part) => normalizeText(part))
        .filter(Boolean);

    return parts.join(', ');
};

const formatAddressSnapshot = (address = {}) => ({
    label: normalizeText(address.label, 'Địa chỉ') || 'Địa chỉ',
    recipientName: normalizeText(address.recipientName),
    phone: normalizeText(address.phone),
    line1: normalizeText(address.line1),
    ward: normalizeText(address.ward),
    district: normalizeText(address.district),
    province: normalizeText(address.province),
    country: normalizeText(address.country, 'Việt Nam') || 'Việt Nam',
    detail: normalizeText(address.detail),
    googleMapsLink: normalizeText(address.googleMapsLink),
    formattedAddress: normalizeText(address.formattedAddress) || formatAddress(address),
});

const getAddressList = (user) => {
    const source = user?.addresses || [];
    return source.map((address) => {
        const item = typeof address.toObject === 'function' ? address.toObject() : address;
        const id = item._id?.toString?.() || item.id || null;

        return {
            id,
            _id: id,
            label: normalizeText(item.label, 'Địa chỉ') || 'Địa chỉ',
            recipientName: normalizeText(item.recipientName),
            phone: normalizeText(item.phone),
            line1: normalizeText(item.line1),
            ward: normalizeText(item.ward),
            district: normalizeText(item.district),
            province: normalizeText(item.province),
            country: normalizeText(item.country, 'Việt Nam') || 'Việt Nam',
            detail: normalizeText(item.detail),
            googleMapsLink: normalizeText(item.googleMapsLink),
            isDefault: Boolean(item.isDefault),
            formattedAddress: formatAddress(item),
        };
    });
};

const getDefaultAddress = (user) => {
    const addresses = getAddressList(user);
    return addresses.find((address) => address.isDefault) || addresses[0] || null;
};

const serializeOrder = (order) => {
    if (!order) {
        return null;
    }

    const source = typeof order.toObject === 'function' ? order.toObject() : order;
    const id = source._id?.toString?.() || source.id || null;
    const address = formatAddressSnapshot(source.shippingAddress || {});
    const items = Array.isArray(source.items)
        ? source.items.map((item) => ({
            productId: item.productId?.toString?.() || item.productId || null,
            slug: item.slug,
            name: item.name,
            image: item.image || '',
            categoryName: item.categoryName || '',
            price: Number(item.price || 0),
            compareAtPrice: Number(item.compareAtPrice || 0),
            quantity: Number(item.quantity || 0),
            lineTotal: Number(item.lineTotal || 0),
        }))
        : [];

    const status = source.status || 'new';
    const autoConfirmAt = source.autoConfirmAt || null;
    const createdAt = source.createdAt || null;
    const statusHistory = Array.isArray(source.statusHistory)
        ? source.statusHistory.map((entry) => ({
            status: entry.status,
            note: entry.note || '',
            actedBy: entry.actedBy?.toString?.() || entry.actedBy || null,
            actorRole: entry.actorRole || 'Member',
            createdAt: entry.createdAt || null,
        }))
        : [];

    const elapsedMinutes = createdAt ? Math.max(Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000), 0) : 0;

    return {
        id,
        _id: id,
        orderCode: source.orderCode,
        userId: source.userId?.toString?.() || source.userId || null,
        customer: {
            name: source.customer?.name || '',
            email: source.customer?.email || '',
            phone: source.customer?.phone || '',
        },
        shippingAddress: address,
        items,
        subtotal: Number(source.subtotal || 0),
        shippingFee: Number(source.shippingFee || 0),
        total: Number(source.total || 0),
        paymentMethod: source.paymentMethod || 'COD',
        paymentMethodLabel: 'Thanh toán khi nhận hàng (COD)',
        paymentStatus: source.paymentStatus || 'pending',
        status,
        statusLabel: ORDER_STATUS_META[status]?.label || status,
        statusColor: ORDER_STATUS_META[status]?.color || 'default',
        statusHistory,
        cancellation: {
            requestStatus: source.cancellation?.requestStatus || 'none',
            requestedAt: source.cancellation?.requestedAt || null,
            requestedReason: source.cancellation?.requestedReason || '',
            reviewedAt: source.cancellation?.reviewedAt || null,
            reviewedBy: source.cancellation?.reviewedBy?.toString?.() || source.cancellation?.reviewedBy || null,
        },
        notes: source.notes || '',
        confirmedAt: source.confirmedAt || null,
        preparingAt: source.preparingAt || null,
        shippedAt: source.shippedAt || null,
        deliveredAt: source.deliveredAt || null,
        cancelledAt: source.cancelledAt || null,
        autoConfirmAt,
        createdAt,
        updatedAt: source.updatedAt || null,
        elapsedMinutes,
        canCancelDirect: status === 'new' && elapsedMinutes < 30,
        canRequestCancel: status === 'preparing' && source.cancellation?.requestStatus !== 'pending',
        isTerminal: ['delivered', 'cancelled'].includes(status),
    };
};

const syncAutoConfirmation = async (order, session = null) => {
    if (!order || order.status !== 'new') {
        return false;
    }

    const autoConfirmAt = order.autoConfirmAt ? new Date(order.autoConfirmAt).getTime() : 0;
    if (!autoConfirmAt || Date.now() < autoConfirmAt) {
        return false;
    }

    order.status = 'confirmed';
    order.confirmedAt = order.confirmedAt || new Date();
    order.statusHistory.push({
        status: 'confirmed',
        note: 'Tự động xác nhận sau 30 phút',
        actedBy: order.userId,
        actorRole: 'System',
        createdAt: new Date(),
    });

    await order.save(session ? { session } : undefined);
    return true;
};

const pushStatusHistory = (order, status, note, actorId, actorRole) => {
    order.statusHistory.push({
        status,
        note: normalizeText(note),
        actedBy: actorId,
        actorRole: normalizeText(actorRole, 'Member') || 'Member',
        createdAt: new Date(),
    });
};

const setStatusTimestamp = (order, status) => {
    const now = new Date();
    if (status === 'confirmed' && !order.confirmedAt) {
        order.confirmedAt = now;
    }
    if (status === 'preparing' && !order.preparingAt) {
        order.preparingAt = now;
    }
    if (status === 'shipped' && !order.shippedAt) {
        order.shippedAt = now;
    }
    if (status === 'delivered' && !order.deliveredAt) {
        order.deliveredAt = now;
        order.paymentStatus = 'paid';
    }
    if (status === 'cancelled' && !order.cancelledAt) {
        order.cancelledAt = now;
    }
};

const ensurePermission = (order, actor) => {
    if (!order) {
        throw createError(404, 'Order not found');
    }

    const isAdmin = String(actor?.role || '').toLowerCase() === 'admin';
    const isStaff = String(actor?.role || '').toLowerCase() === 'staff';
    const ownerId = order.userId?.toString?.() || order.userId;

    if (!isAdmin && !isStaff && actor?.id?.toString?.() !== ownerId) {
        throw createError(403, 'Bạn không có quyền truy cập đơn hàng này');
    }
};

const getOrderQuery = (actor) => {
    const isAdmin = String(actor?.role || '').toLowerCase() === 'admin';
    const isStaff = String(actor?.role || '').toLowerCase() === 'staff';
    if (isAdmin || isStaff) {
        return {};
    }

    return { userId: actor.id };
};

const checkoutOrderService = async (userId, payload = {}) => {
    const paymentMethod = normalizeText(payload.paymentMethod, 'COD').toUpperCase();
    if (paymentMethod !== 'COD') {
        throw createError(400, 'Chỉ hỗ trợ thanh toán COD');
    }

    const session = await mongoose.startSession();
    let createdOrder = null;

    try {
        await session.withTransaction(async () => {
            const user = await User.findById(userId).session(session);
            if (!user) {
                throw createError(404, 'User not found');
            }

            const cart = await Cart.findOne({ userId }).session(session);
            if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
                throw createError(400, 'Giỏ hàng đang trống');
            }

            const productIds = cart.items.map((item) => item.product?.toString?.() || item.product).filter(Boolean);
            const products = await Product.find({ _id: { $in: productIds } }).session(session);
            const productMap = new Map(products.map((product) => [product._id.toString(), product]));

            const shippingAddressId = normalizeText(payload.addressId || payload.shippingAddressId);
            let selectedAddress = null;

            if (shippingAddressId) {
                const address = user.addresses.id(shippingAddressId);
                if (!address) {
                    throw createError(404, 'Địa chỉ giao hàng không tồn tại');
                }

                selectedAddress = formatAddressSnapshot(address);
            } else {
                const addressPayload = payload.address || payload.shippingAddress || payload;
                const shouldCreateAddress = Boolean(addressPayload?.recipientName || addressPayload?.name || addressPayload?.line1 || addressPayload?.addressLine1 || addressPayload?.street);

                if (shouldCreateAddress) {
                    const normalizedAddress = formatAddressSnapshot({
                        label: addressPayload.label,
                        recipientName: addressPayload.recipientName || addressPayload.name || user.name,
                        phone: addressPayload.phone,
                        line1: addressPayload.line1 || addressPayload.addressLine1 || addressPayload.street,
                        ward: addressPayload.ward,
                        district: addressPayload.district,
                        province: addressPayload.province,
                        country: addressPayload.country || 'Việt Nam',
                        detail: addressPayload.detail,
                        googleMapsLink: addressPayload.googleMapsLink,
                    });

                    const newAddress = user.addresses.create({
                        label: normalizedAddress.label,
                        recipientName: normalizedAddress.recipientName,
                        phone: normalizedAddress.phone,
                        line1: normalizedAddress.line1,
                        ward: normalizedAddress.ward,
                        district: normalizedAddress.district,
                        province: normalizedAddress.province,
                        country: normalizedAddress.country,
                        detail: normalizedAddress.detail,
                        googleMapsLink: normalizedAddress.googleMapsLink,
                        isDefault: Boolean(addressPayload.isDefault || addressPayload.default || user.addresses.length === 0),
                    });

                    if (newAddress.isDefault) {
                        user.addresses.forEach((item) => {
                            item.isDefault = false;
                        });
                    }

                    user.addresses.push(newAddress);
                    await user.save({ session });

                    selectedAddress = formatAddressSnapshot(newAddress);
                } else {
                    selectedAddress = formatAddressSnapshot(getDefaultAddress(user));
                    if (!selectedAddress?.line1) {
                        throw createError(400, 'Vui lòng thêm địa chỉ giao hàng trước khi đặt hàng');
                    }
                }
            }

            const orderItems = [];
            let subtotal = 0;

            for (const cartItem of cart.items) {
                const productId = cartItem.product?.toString?.() || cartItem.product;
                const product = productMap.get(productId);

                if (!product) {
                    throw createError(404, 'Sản phẩm trong giỏ hàng không còn tồn tại');
                }

                const quantity = Number(cartItem.quantity || 0);
                if (quantity < 1) {
                    throw createError(400, 'Số lượng sản phẩm không hợp lệ');
                }

                if (Number(product.stock || 0) < quantity) {
                    throw createError(400, `Sản phẩm ${product.name} không đủ tồn kho`);
                }

                product.stock = Number(product.stock || 0) - quantity;
                product.sold = Number(product.sold || 0) + quantity;
                await product.save({ session });

                const price = Number(product.price || 0);
                const compareAtPrice = Number(product.compareAtPrice || 0);
                const lineTotal = price * quantity;

                subtotal += lineTotal;
                orderItems.push({
                    productId: product._id,
                    slug: product.slug,
                    name: product.name,
                    image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '',
                    categoryName: product.categoryName,
                    price,
                    compareAtPrice,
                    quantity,
                    lineTotal,
                });
            }

            const shippingFee = Number(payload.shippingFee || 0);
            const orderDoc = await Order.create([
                {
                    orderCode: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
                    userId,
                    customer: {
                        name: user.name,
                        email: user.email,
                        phone: selectedAddress.phone,
                    },
                    shippingAddress: selectedAddress,
                    items: orderItems,
                    subtotal,
                    shippingFee,
                    total: subtotal + shippingFee,
                    paymentMethod: 'COD',
                    paymentStatus: 'pending',
                    status: 'new',
                    statusHistory: [{
                        status: 'new',
                        note: 'Đơn hàng được đặt thành công',
                        actedBy: userId,
                        actorRole: 'Member',
                        createdAt: new Date(),
                    }],
                    notes: normalizeText(payload.notes),
                    autoConfirmAt: new Date(Date.now() + 30 * 60 * 1000),
                },
            ], { session });

            await Cart.deleteOne({ userId }).session(session);
            createdOrder = orderDoc[0];
        });
    } finally {
        session.endSession();
    }

    return serializeOrder(createdOrder);
};

const listOrdersService = async (actor = {}) => {
    const query = getOrderQuery(actor);
    const orders = await Order.find(query).sort({ createdAt: -1 });

    const result = [];
    for (const order of orders) {
        await syncAutoConfirmation(order);
        if (order.isModified()) {
            await order.save();
        }
        result.push(serializeOrder(order));
    }

    return result;
};

const getOrderDetailService = async (actor = {}, id) => {
    const order = await Order.findById(id);
    if (!order) {
        throw createError(404, 'Order not found');
    }

    ensurePermission(order, actor);
    await syncAutoConfirmation(order);
    if (order.isModified()) {
        await order.save();
    }

    return serializeOrder(order);
};

const cancelOrderService = async (actor = {}, id, payload = {}) => {
    const order = await Order.findById(id);
    if (!order) {
        throw createError(404, 'Order not found');
    }

    ensurePermission(order, actor);
    await syncAutoConfirmation(order);
    if (order.isModified()) {
        await order.save();
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
        throw createError(400, 'Đơn hàng đã hoàn tất hoặc đã bị hủy');
    }

    const elapsedMinutes = order.createdAt ? Math.max(Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000), 0) : 0;
    const reason = normalizeText(payload.reason || payload.note);

    if (elapsedMinutes < 30 && ['new', 'confirmed'].includes(order.status)) {
        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancellation.requestStatus = 'approved';
        order.cancellation.reviewedAt = new Date();
        order.cancellation.reviewedBy = actor?.id || order.userId;
        order.cancellation.requestedReason = reason;
        pushStatusHistory(order, 'cancelled', reason || 'Người dùng hủy đơn trong 30 phút', actor?.id || order.userId, actor?.role || 'Member');
        await order.save();
        return serializeOrder(order);
    }

    if (order.status === 'preparing') {
        order.cancellation.requestStatus = 'pending';
        order.cancellation.requestedAt = new Date();
        order.cancellation.requestedReason = reason;
        pushStatusHistory(order, 'preparing', reason ? `Gửi yêu cầu hủy đơn: ${reason}` : 'Gửi yêu cầu hủy đơn cho shop', actor?.id || order.userId, actor?.role || 'Member');
        await order.save();
        return serializeOrder(order);
    }

    throw createError(400, 'Đơn hàng chỉ có thể hủy trong 30 phút đầu hoặc gửi yêu cầu hủy khi shop đang chuẩn bị hàng');
};

const updateOrderStatusService = async (actor = {}, id, payload = {}) => {
    const order = await Order.findById(id);
    if (!order) {
        throw createError(404, 'Order not found');
    }

    const isAdmin = String(actor?.role || '').toLowerCase() === 'admin';
    const isStaff = String(actor?.role || '').toLowerCase() === 'staff';
    if (!isAdmin && !isStaff) {
        throw createError(403, 'Chỉ Admin hoặc Staff mới có quyền cập nhật trạng thái đơn hàng');
    }

    await syncAutoConfirmation(order);
    if (order.isModified()) {
        await order.save();
    }

    const nextStatus = normalizeText(payload.status).toLowerCase();
    if (!ORDER_STATUSES.includes(nextStatus)) {
        throw createError(400, 'Trạng thái đơn hàng không hợp lệ');
    }

    if (order.status === nextStatus) {
        return serializeOrder(order);
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
        throw createError(400, 'Đơn hàng đã hoàn tất, không thể cập nhật trạng thái');
    }

    const nextIndex = ORDER_STATUS_SEQUENCE.indexOf(nextStatus);
    const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(order.status);
    if (nextStatus !== 'cancelled' && nextIndex !== -1 && currentIndex !== -1 && nextIndex < currentIndex) {
        throw createError(400, 'Không thể chuyển trạng thái ngược chiều');
    }

    order.status = nextStatus;
    setStatusTimestamp(order, nextStatus);
    pushStatusHistory(order, nextStatus, payload.note || '', actor?.id, actor?.role || 'Admin');

    if (nextStatus === 'cancelled') {
        order.cancellation.requestStatus = 'approved';
        order.cancellation.reviewedAt = new Date();
        order.cancellation.reviewedBy = actor?.id;
    }

    await order.save();
    return serializeOrder(order);
};

module.exports = {
    checkoutOrderService,
    listOrdersService,
    getOrderDetailService,
    cancelOrderService,
    updateOrderStatusService,
    ORDER_STATUS_META,
};