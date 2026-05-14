const Promotion = require('../models/promotion');
const { slugify } = require('./catalog.shared');

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

const getPromotionsService = async () => {
    return Promotion.find({ active: true }).sort({ order: 1 }).lean();
};

const getPromotionDetailService = async (slug) => {
    return Promotion.findOne({ slug }).lean();
};

const createPromotionService = async (payload = {}) => {
    const title = String(payload.title || '').trim();
    if (!title) {
        throw createError(400, 'Promotion title is required');
    }

    const slugSource = payload.slug ?? title;
    const slug = slugify(slugSource);
    if (!slug) {
        throw createError(400, 'Promotion slug is required');
    }

    const exists = await Promotion.findOne({ slug }).lean();
    if (exists) {
        throw createError(409, 'Promotion slug already exists');
    }

    const activeValue = parseBoolean(payload.active);

    return Promotion.create({
        title,
        slug,
        badge: payload.badge,
        description: payload.description,
        highlight: payload.highlight,
        buttonLabel: payload.buttonLabel,
        banner: payload.banner,
        order: payload.order ?? 0,
        active: activeValue === undefined ? true : activeValue,
    });
};

const updatePromotionService = async (slug, payload = {}) => {
    const promotion = await Promotion.findOne({ slug });
    if (!promotion) {
        throw createError(404, 'Promotion not found');
    }

    const update = {};

    if (payload.title !== undefined) {
        const title = String(payload.title || '').trim();
        if (!title) {
            throw createError(400, 'Promotion title is required');
        }
        update.title = title;
    }

    if (payload.slug !== undefined) {
        const nextSlug = slugify(payload.slug || '');
        if (!nextSlug) {
            throw createError(400, 'Promotion slug is required');
        }
        if (nextSlug !== slug) {
            const exists = await Promotion.findOne({ slug: nextSlug }).lean();
            if (exists) {
                throw createError(409, 'Promotion slug already exists');
            }
            update.slug = nextSlug;
        }
    }

    if (payload.badge !== undefined) {
        update.badge = payload.badge;
    }

    if (payload.description !== undefined) {
        update.description = payload.description;
    }

    if (payload.highlight !== undefined) {
        update.highlight = payload.highlight;
    }

    if (payload.buttonLabel !== undefined) {
        update.buttonLabel = payload.buttonLabel;
    }

    if (payload.banner !== undefined) {
        update.banner = payload.banner;
    }

    if (payload.order !== undefined) {
        update.order = Number(payload.order) || 0;
    }

    const activeValue = parseBoolean(payload.active);
    if (activeValue !== undefined) {
        update.active = activeValue;
    }

    if (Object.keys(update).length === 0) {
        return promotion.toObject();
    }

    const updated = await Promotion.findOneAndUpdate({ slug }, update, {
        new: true,
        runValidators: true,
    });

    return updated.toObject();
};

const deletePromotionService = async (slug) => {
    return Promotion.findOneAndDelete({ slug }).lean();
};

module.exports = {
    getPromotionsService,
    getPromotionDetailService,
    createPromotionService,
    updatePromotionService,
    deletePromotionService,
};