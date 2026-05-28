/**
 * Shipping Fee Calculator
 * 
 * Calculates shipping fee based on destination province relative to 
 * the shop's base province (TP. Hồ Chí Minh).
 * 
 * Tiers:
 *  - Same city (HCM): 20,000đ
 *  - South region (nearby provinces): 30,000đ
 *  - Central region: 40,000đ
 *  - North region: 50,000đ
 *  - Unknown / international: 60,000đ
 */

const SHOP_PROVINCE = 'hồ chí minh';

const SOUTH_PROVINCES = [
    'bình dương', 'đồng nai', 'long an', 'tây ninh', 'bà rịa', 'vũng tàu',
    'tiền giang', 'bến tre', 'vĩnh long', 'trà vinh', 'hậu giang', 'sóc trăng',
    'bạc liêu', 'cà mau', 'kiên giang', 'an giang', 'đồng tháp', 'cần thơ',
];

const CENTRAL_PROVINCES = [
    'đà nẵng', 'thừa thiên huế', 'huế', 'quảng nam', 'quảng ngãi',
    'bình định', 'phú yên', 'khánh hòa', 'nha trang', 'ninh thuận', 'bình thuận',
    'gia lai', 'kon tum', 'đắk lắk', 'đắk nông', 'lâm đồng', 'đà lạt',
    'quảng bình', 'quảng trị',
];

const NORTH_PROVINCES = [
    'hà nội', 'hải phòng', 'hải dương', 'hưng yên', 'thái bình', 'nam định',
    'ninh bình', 'hà nam', 'bắc ninh', 'bắc giang', 'quảng ninh', 'hải dương',
    'vĩnh phúc', 'phú thọ', 'tuyên quang', 'hà giang', 'cao bằng', 'lạng sơn',
    'thái nguyên', 'bắc kạn', 'lào cai', 'yên bái', 'sơn la', 'điện biên',
    'lai châu', 'hòa bình', 'thanh hóa', 'nghệ an', 'hà tĩnh',
];

const SHIPPING_TIERS = {
    same_city: { fee: 20000, label: 'Nội thành TP.HCM', estimatedDays: '1-2' },
    south: { fee: 30000, label: 'Khu vực miền Nam', estimatedDays: '1-3' },
    central: { fee: 40000, label: 'Khu vực miền Trung', estimatedDays: '2-4' },
    north: { fee: 50000, label: 'Khu vực miền Bắc', estimatedDays: '3-5' },
    other: { fee: 60000, label: 'Tỉnh thành khác / Quốc tế', estimatedDays: '5-7' },
};

/**
 * Normalize a province string for matching
 */
const normalizeProvince = (str) =>
    String(str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9 ]/g, '')
        .trim();

/**
 * Calculate shipping fee for a given destination province
 * @param {string} province - Destination province/city
 * @returns {{ fee: number, tier: string, label: string, estimatedDays: string }}
 */
const calculateShippingFee = (province) => {
    const normalized = normalizeProvince(province);

    if (!normalized) {
        return { fee: SHIPPING_TIERS.other.fee, tier: 'other', ...SHIPPING_TIERS.other };
    }

    // Check same city
    if (normalized.includes('ho chi minh') || normalized.includes('hcm') || normalized.includes('sai gon')) {
        return { fee: SHIPPING_TIERS.same_city.fee, tier: 'same_city', ...SHIPPING_TIERS.same_city };
    }

    // Check South
    for (const p of SOUTH_PROVINCES) {
        const normP = normalizeProvince(p);
        if (normalized.includes(normP) || normP.includes(normalized)) {
            return { fee: SHIPPING_TIERS.south.fee, tier: 'south', ...SHIPPING_TIERS.south };
        }
    }

    // Check Central
    for (const p of CENTRAL_PROVINCES) {
        const normP = normalizeProvince(p);
        if (normalized.includes(normP) || normP.includes(normalized)) {
            return { fee: SHIPPING_TIERS.central.fee, tier: 'central', ...SHIPPING_TIERS.central };
        }
    }

    // Check North
    for (const p of NORTH_PROVINCES) {
        const normP = normalizeProvince(p);
        if (normalized.includes(normP) || normP.includes(normalized)) {
            return { fee: SHIPPING_TIERS.north.fee, tier: 'north', ...SHIPPING_TIERS.north };
        }
    }

    return { fee: SHIPPING_TIERS.other.fee, tier: 'other', ...SHIPPING_TIERS.other };
};

/**
 * Express handler: POST /api/shipping/calculate
 * Body: { province: string }
 */
const calculateShipping = (req, res) => {
    const { province } = req.body;
    const result = calculateShippingFee(province);
    return res.status(200).json({ success: true, data: result });
};

module.exports = { calculateShippingFee, calculateShipping, SHIPPING_TIERS };
