const normalizeList = (value) => {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    if (!value) {
        return [];
    }

    return String(value)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildProductQuery = (filters = {}) => {
    const query = {};
    const keyword = String(filters.q || filters.search || '').trim();
    const categorySlugs = normalizeList(filters.category || filters.categories);

    if (keyword) {
        const regex = new RegExp(escapeRegex(keyword), 'i');
        query.$or = [
            { name: regex },
            { shortDescription: regex },
            { description: regex },
            { tags: regex },
            { categoryName: regex },
        ];
    }

    if (categorySlugs.length > 0) {
        query.categorySlug = { $in: categorySlugs };
    }

    if (filters.minPrice !== undefined && filters.minPrice !== '') {
        query.price = query.price || {};
        query.price.$gte = Number(filters.minPrice);
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
        query.price = query.price || {};
        query.price.$lte = Number(filters.maxPrice);
    }

    const flagMap = [
        ['inStock', 'stock'],
        ['bestSeller', 'bestSeller'],
        ['featured', 'featured'],
        ['onSale', 'onSale'],
        ['isNew', 'isNew'],
    ];

    flagMap.forEach(([paramKey, fieldKey]) => {
        const rawValue = filters[paramKey];

        if (rawValue === true || rawValue === 'true' || rawValue === '1') {
            if (fieldKey === 'stock') {
                query.stock = { $gt: 0 };
            } else {
                query[fieldKey] = true;
            }
        }
    });

    return query;
};

const buildSortQuery = (sort = 'featured') => {
    const sortMap = {
        featured: { featured: -1, releasedAt: -1 },
        popular: { sold: -1, rating: -1 },
        newest: { releasedAt: -1 },
        priceAsc: { price: 1 },
        priceDesc: { price: -1 },
        rating: { rating: -1, sold: -1 },
    };

    return sortMap[sort] || sortMap.featured;
};

const decorateProduct = (product) => {
    if (!product) {
        return null;
    }

    const salePercent = product.compareAtPrice > product.price
        ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
        : 0;

    return {
        ...product,
        salePercent,
        imageCount: Array.isArray(product.images) ? product.images.length : 0,
        availability: product.stock > 0 ? 'In stock' : 'Sold out',
    };
};

module.exports = {
    normalizeList,
    escapeRegex,
    buildProductQuery,
    buildSortQuery,
    decorateProduct,
};