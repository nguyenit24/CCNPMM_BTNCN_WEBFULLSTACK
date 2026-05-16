const splitList = (value) => {
    if (!value) {
        return [];
    }

    return String(value)
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean);
};

const joinList = (value) => {
    if (!Array.isArray(value)) {
        return '';
    }

    return value.join(', ');
};

const parseJsonArray = (value, label) => {
    if (!value) {
        return undefined;
    }

    try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
            throw new Error('not-array');
        }
        return parsed;
    } catch (error) {
        throw new Error(`${label} JSON is invalid`);
    }
};

const normalizeCollection = (data) => {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.items)) {
        return data.items;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    return [];
};

export {
    splitList,
    joinList,
    parseJsonArray,
    normalizeCollection,
};
