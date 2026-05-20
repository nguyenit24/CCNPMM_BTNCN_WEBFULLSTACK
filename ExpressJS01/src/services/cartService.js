const Cart = require('../models/cart');
const Product = require('../models/product');

const createError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const parseQuantity = (value) => {
    if (value === undefined || value === null || value === '') {
        return 1;
    }

    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity < 1) {
        return undefined;
    }

    return quantity;
};

const normalizeCartItem = (item) => {
    const product = item?.product;

    if (!product?._id) {
        return null;
    }

    const quantity = Number(item.quantity || 0);
    const price = Number(product.price || 0);
    const compareAtPrice = Number(product.compareAtPrice || 0);

    return {
        productId: product._id.toString(),
        slug: product.slug,
        name: product.name,
        categorySlug: product.categorySlug,
        categoryName: product.categoryName,
        shortDescription: product.shortDescription,
        images: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
        stock: Number(product.stock || 0),
        price,
        compareAtPrice,
        salePercent: compareAtPrice > price ? Math.round((1 - price / compareAtPrice) * 100) : 0,
        quantity,
        lineTotal: price * quantity,
        inStock: Number(product.stock || 0) > 0,
    };
};

const buildCartResponse = (cartDoc) => {
    const items = (cartDoc?.items || [])
        .map(normalizeCartItem)
        .filter(Boolean);

    const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);
    const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);

    return {
        cart: {
            id: cartDoc?._id?.toString() || null,
            userId: cartDoc?.userId?.toString?.() || cartDoc?.userId || null,
            items,
            subtotal,
            totalQuantity,
            itemCount: items.length,
            updatedAt: cartDoc?.updatedAt || null,
        },
        empty: items.length === 0,
    };
};

const resolveProductBySlug = async (slug) => {
    const normalizedSlug = String(slug || '').trim();
    if (!normalizedSlug) {
        throw createError(400, 'Product slug is required');
    }

    const product = await Product.findOne({ slug: normalizedSlug }).lean();
    if (!product) {
        throw createError(404, 'Product not found');
    }

    return product;
};

const getOrCreateCart = async (userId) => {
    const cart = await Cart.findOne({ userId });
    if (cart) {
        return cart;
    }

    return Cart.create({ userId, items: [] });
};

const getCartService = async (userId) => {
    const cart = await Cart.findOne({ userId }).populate('items.product').lean();
    return buildCartResponse(cart);
};

const addCartItemService = async (userId, payload = {}) => {
    const product = await resolveProductBySlug(payload.slug || payload.productSlug);
    const quantity = parseQuantity(payload.quantity);

    if (quantity === undefined) {
        throw createError(400, 'Quantity must be at least 1');
    }

    if (Number(product.stock || 0) <= 0) {
        throw createError(400, 'Sản phẩm đã hết hàng');
    }

    if (quantity > Number(product.stock || 0)) {
        throw createError(400, 'Số lượng vượt quá tồn kho');
    }

    const cart = await getOrCreateCart(userId);
    const existingItem = cart.items.find((item) => item.product?.toString() === product._id.toString());
    const nextQuantity = Number(existingItem?.quantity || 0) + quantity;

    if (nextQuantity > Number(product.stock || 0)) {
        throw createError(400, 'Số lượng trong giỏ vượt quá tồn kho');
    }

    if (existingItem) {
        existingItem.quantity = nextQuantity;
    } else {
        cart.items.push({ product: product._id, quantity });
    }

    await cart.save();
    return getCartService(userId);
};

const updateCartItemService = async (userId, slug, payload = {}) => {
    const product = await resolveProductBySlug(slug);
    const quantity = parseQuantity(payload.quantity);

    if (quantity === undefined) {
        throw createError(400, 'Quantity must be at least 1');
    }

    if (quantity > Number(product.stock || 0)) {
        throw createError(400, 'Số lượng vượt quá tồn kho');
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
        throw createError(404, 'Cart not found');
    }

    const existingItem = cart.items.find((item) => item.product?.toString() === product._id.toString());
    if (!existingItem) {
        throw createError(404, 'Cart item not found');
    }

    existingItem.quantity = quantity;
    await cart.save();

    return getCartService(userId);
};

const removeCartItemService = async (userId, slug) => {
    const product = await resolveProductBySlug(slug);
    const cart = await Cart.findOne({ userId });

    if (!cart) {
        return getCartService(userId);
    }

    cart.items = cart.items.filter((item) => item.product?.toString() !== product._id.toString());

    if (cart.items.length === 0) {
        await cart.deleteOne();
        return getCartService(userId);
    }

    await cart.save();
    return getCartService(userId);
};

const clearCartService = async (userId) => {
    await Cart.deleteOne({ userId });
    return getCartService(userId);
};

module.exports = {
    getCartService,
    addCartItemService,
    updateCartItemService,
    removeCartItemService,
    clearCartService,
};