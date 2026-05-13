const moneyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const escapeXml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const svgToDataUri = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const makeArt = ({ title, label, palette, variant = 1 }) => {
    const [bgStart, bgMid, accent, glow] = palette;
    const titleText = escapeXml(title);
    const labelText = escapeXml(label);

    const shapes = variant === 1
        ? `
            <rect x="110" y="182" width="520" height="248" rx="36" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.22)" />
            <rect x="164" y="238" width="410" height="132" rx="24" fill="rgba(15,23,42,0.38)" />
            <circle cx="216" cy="352" r="16" fill="${accent}" />
            <circle cx="262" cy="352" r="16" fill="rgba(255,255,255,0.48)" />
            <circle cx="308" cy="352" r="16" fill="rgba(255,255,255,0.32)" />
            <circle cx="354" cy="352" r="16" fill="rgba(255,255,255,0.22)" />
            <circle cx="400" cy="352" r="16" fill="rgba(255,255,255,0.32)" />
            <circle cx="446" cy="352" r="16" fill="rgba(255,255,255,0.48)" />
            <circle cx="492" cy="352" r="16" fill="${glow}" />
        `
        : variant === 2
            ? `
            <rect x="156" y="162" width="550" height="296" rx="150" fill="rgba(255,255,255,0.12)" />
            <rect x="322" y="198" width="220" height="224" rx="110" fill="rgba(255,255,255,0.18)" />
            <circle cx="432" cy="242" r="20" fill="${accent}" />
            <circle cx="432" cy="242" r="66" fill="rgba(255,255,255,0.16)" />
        `
            : `
            <rect x="146" y="188" width="490" height="242" rx="34" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.16)" />
            <rect x="190" y="228" width="402" height="166" rx="22" fill="rgba(15,23,42,0.34)" />
            <circle cx="610" cy="254" r="20" fill="${accent}" />
        `;

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720">
        <defs>
            <linearGradient id="bg${variant}" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="${bgStart}" />
                <stop offset="55%" stop-color="${bgMid}" />
                <stop offset="100%" stop-color="${accent}" />
            </linearGradient>
            <radialGradient id="glow${variant}" cx="65%" cy="22%" r="62%">
                <stop offset="0%" stop-color="${glow}" stop-opacity="0.9" />
                <stop offset="100%" stop-color="${glow}" stop-opacity="0" />
            </radialGradient>
        </defs>
        <rect width="960" height="720" fill="url(#bg${variant})" />
        <rect width="960" height="720" fill="url(#glow${variant})" />
        <circle cx="798" cy="154" r="138" fill="rgba(255,255,255,0.18)" />
        <circle cx="156" cy="558" r="130" fill="rgba(15,23,42,0.18)" />
        ${shapes}
        <text x="64" y="102" fill="rgba(255,255,255,0.82)" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" letter-spacing="3">${labelText}</text>
        <text x="64" y="642" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700">${titleText}</text>
    </svg>`;

    return svgToDataUri(svg);
};

const mockCategories = [
    {
        name: 'Keyboards',
        slug: 'keyboards',
        description: 'Bàn phím cơ và bàn phím gaming cao cấp.',
        order: 1,
        image: makeArt({
            title: 'Keyboards',
            label: 'Category',
            palette: ['#0f172a', '#1e293b', '#38bdf8', '#e2e8f0'],
            variant: 1,
        }),
    },
    {
        name: 'Mice',
        slug: 'mice',
        description: 'Chuột không dây và chuột hiệu năng cao.',
        order: 2,
        image: makeArt({
            title: 'Mice',
            label: 'Category',
            palette: ['#111827', '#334155', '#f97316', '#fde68a'],
            variant: 2,
        }),
    },
    {
        name: 'Audio',
        slug: 'audio',
        description: 'Tai nghe và thiết bị âm thanh tinh gọn.',
        order: 3,
        image: makeArt({
            title: 'Audio',
            label: 'Category',
            palette: ['#0f172a', '#1f2937', '#22c55e', '#bbf7d0'],
            variant: 3,
        }),
    },
    {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Dock, desk mat và phụ kiện setup.',
        order: 4,
        image: makeArt({
            title: 'Accessories',
            label: 'Category',
            palette: ['#1e1b4b', '#312e81', '#a78bfa', '#ede9fe'],
            variant: 1,
        }),
    },
];

const mockPromotions = [
    {
        title: 'Member Welcome Deal',
        slug: 'member-welcome-deal',
        badge: 'Member only',
        description: 'Giảm giá đặc biệt cho thành viên mới.',
        highlight: 'Lên đến 30% cho bộ thiết bị làm việc cao cấp.',
        buttonLabel: 'Xem ưu đãi',
        banner: makeArt({
            title: 'Member Welcome Deal',
            label: 'Promo',
            palette: ['#0f172a', '#1e293b', '#38bdf8', '#93c5fd'],
            variant: 2,
        }),
    },
    {
        title: 'Newest Arrivals',
        slug: 'newest-arrivals',
        badge: 'Just dropped',
        description: 'Các mẫu phím, chuột và phụ kiện mới nhất.',
        highlight: 'Luôn có sẵn hàng mới và thiết kế hoàn thiện.',
        buttonLabel: 'Khám phá ngay',
        banner: makeArt({
            title: 'Newest Arrivals',
            label: 'Promo',
            palette: ['#111827', '#1f2937', '#f97316', '#fdba74'],
            variant: 1,
        }),
    },
    {
        title: 'Best Seller Bundle',
        slug: 'best-seller-bundle',
        badge: 'Hot sale',
        description: 'Combo bán chạy nhất dành cho setup gọn.',
        highlight: 'Tiết kiệm nhiều hơn khi mua theo bộ.',
        buttonLabel: 'Mua bundle',
        banner: makeArt({
            title: 'Best Seller Bundle',
            label: 'Promo',
            palette: ['#0f172a', '#1e293b', '#22c55e', '#86efac'],
            variant: 3,
        }),
    },
];

const mockPosts = [
    {
        title: 'Cách chọn switch phù hợp cho bàn phím cơ cao cấp',
        slug: 'how-to-choose-switches',
        excerpt: 'So sánh linear, tactile và clicky để chọn đúng cảm giác gõ cho công việc và giải trí.',
        content: 'Bài viết ngắn tập trung vào cảm giác gõ, độ ồn và mục đích sử dụng. Nếu bạn làm việc chung văn phòng, tactile thường cân bằng nhất; nếu ưu tiên tốc độ và âm thanh nhẹ, linear sẽ dễ tiếp cận hơn.',
        categorySlug: 'news',
        categoryName: 'Tech News',
        readTime: '4 min read',
        publishedAt: '2026-05-10T08:00:00.000Z',
        featured: true,
        tags: ['keyboard', 'switch', 'guide'],
        cover: makeArt({
            title: 'Cách chọn switch',
            label: 'News',
            palette: ['#0f172a', '#1e293b', '#38bdf8', '#cbd5e1'],
            variant: 1,
        }),
    },
    {
        title: 'Bố trí bàn làm việc gọn với docking station và desk mat',
        slug: 'clean-desk-setup',
        excerpt: 'Giữ dây cáp gọn gàng và tăng độ tập trung bằng một bố cục tối giản.',
        content: 'Docking station giúp gom cổng kết nối, còn desk mat tạo nền làm việc liền mạch và thoải mái hơn. Kết hợp cùng chuột không dây và đèn monitor bar sẽ giúp mặt bàn sạch, rõ và dễ tập trung.',
        categorySlug: 'news',
        categoryName: 'Setup Tips',
        readTime: '3 min read',
        publishedAt: '2026-05-08T08:00:00.000Z',
        featured: true,
        tags: ['setup', 'desk', 'accessories'],
        cover: makeArt({
            title: 'Clean Desk Setup',
            label: 'News',
            palette: ['#111827', '#334155', '#f97316', '#fed7aa'],
            variant: 2,
        }),
    },
    {
        title: 'Vì sao chuột cao cấp đáng tiền hơn ở thời gian dài',
        slug: 'why-premium-mouse-matters',
        excerpt: 'Cảm biến, độ trễ và ergonomics là những điểm tạo ra khác biệt thật sự.',
        content: 'Một con chuột tốt không chỉ cho cảm giác trơn hơn mà còn giảm mỏi tay khi dùng hàng giờ. Với nhóm member làm việc sáng tạo, phím tắt và độ chính xác là hai yếu tố đáng đầu tư trước tiên.',
        categorySlug: 'news',
        categoryName: 'Buying Guide',
        readTime: '5 min read',
        publishedAt: '2026-05-06T08:00:00.000Z',
        featured: false,
        tags: ['mouse', 'ergonomic', 'productivity'],
        cover: makeArt({
            title: 'Premium Mouse',
            label: 'News',
            palette: ['#0f172a', '#1f2937', '#22c55e', '#bbf7d0'],
            variant: 3,
        }),
    },
];

const mockProducts = [
    {
        name: 'Keychron K8 Pro Wireless Mechanical Keyboard',
        slug: 'keychron-k8-pro-wireless-mechanical-keyboard',
        categorySlug: 'keyboards',
        categoryName: 'Keyboards',
        shortDescription: 'A popular compact keyboard for work and gaming.',
        description: 'The K8 Pro keeps the desk tidy while still delivering a tactile premium typing experience. It is a safe recommendation for members starting a serious keyboard setup.',
        price: 109.99,
        compareAtPrice: 149.99,
        stock: 15,
        sold: 1200,
        rating: 4.9,
        featured: true,
        bestSeller: true,
        isNew: true,
        onSale: true,
        releasedAt: '2026-05-09T08:00:00.000Z',
        tags: ['wireless', 'compact', 'hot-swap'],
        specs: [
            { label: 'Brand', value: 'Keychron' },
            { label: 'Model', value: 'K8 Pro' },
            { label: 'Switch Type', value: 'Gateron G Pro Brown' },
            { label: 'Layout', value: '75% (84 keys)' },
            { label: 'Connection', value: 'Wireless 2.4GHz / Bluetooth 5.1 / USB-C' },
            { label: 'Battery', value: '4000mAh rechargeable' },
            { label: 'Hot-swappable', value: 'Yes' },
        ],
        images: [
            makeArt({ title: 'Keychron K8 Pro', label: 'New', palette: ['#111827', '#334155', '#f97316', '#fde68a'], variant: 1 }),
            makeArt({ title: 'Keychron K8 Pro', label: 'Gallery', palette: ['#0f172a', '#1e293b', '#38bdf8', '#e2e8f0'], variant: 2 }),
            makeArt({ title: 'Keychron K8 Pro', label: 'Detail', palette: ['#1e1b4b', '#312e81', '#a78bfa', '#ede9fe'], variant: 3 }),
        ],
    },
    {
        name: 'Custom Mechanical Keyboard - 75% Layout',
        slug: 'custom-mechanical-keyboard-75-layout',
        categorySlug: 'keyboards',
        categoryName: 'Keyboards',
        shortDescription: 'Compact premium build with hot-swap support.',
        description: 'A 75% keyboard tuned for members who want a refined typing feel without wasting desk space.',
        price: 199.99,
        compareAtPrice: 229.99,
        stock: 14,
        sold: 1250,
        rating: 4.8,
        featured: true,
        bestSeller: true,
        isNew: true,
        onSale: true,
        releasedAt: '2026-05-11T08:00:00.000Z',
        tags: ['wireless', 'hot-swap', 'aluminum'],
        specs: [
            { label: 'Layout', value: '75%' },
            { label: 'Connection', value: 'Bluetooth + 2.4GHz + USB-C' },
            { label: 'Battery', value: '4,000 mAh' },
        ],
        images: [
            makeArt({ title: 'Custom Keyboard', label: 'New', palette: ['#0f172a', '#1e293b', '#38bdf8', '#e2e8f0'], variant: 1 }),
            makeArt({ title: 'Custom Keyboard', label: 'Gallery', palette: ['#111827', '#334155', '#f97316', '#fde68a'], variant: 2 }),
            makeArt({ title: 'Custom Keyboard', label: 'Detail', palette: ['#1e1b4b', '#312e81', '#a78bfa', '#ede9fe'], variant: 3 }),
        ],
    },
    {
        name: 'Gaming Mechanical Keyboard RGB - Full Size',
        slug: 'gaming-mechanical-keyboard-rgb-full-size',
        categorySlug: 'keyboards',
        categoryName: 'Keyboards',
        shortDescription: 'Full-size board with RGB and fast response.',
        description: 'A full-size board for users who want number pad convenience and a dramatic RGB look.',
        price: 89.99,
        compareAtPrice: 119.99,
        stock: 31,
        sold: 1420,
        rating: 4.7,
        featured: true,
        bestSeller: true,
        isNew: false,
        onSale: true,
        releasedAt: '2026-05-07T08:00:00.000Z',
        tags: ['rgb', 'full-size', 'gaming'],
        specs: [
            { label: 'Layout', value: 'Full size' },
            { label: 'Lighting', value: 'Per-key RGB' },
            { label: 'Profile', value: 'Low-latency gaming' },
        ],
        images: [
            makeArt({ title: 'Gaming RGB Keyboard', label: 'Popular', palette: ['#1e1b4b', '#312e81', '#a78bfa', '#ede9fe'], variant: 1 }),
            makeArt({ title: 'Gaming RGB Keyboard', label: 'Gallery', palette: ['#111827', '#334155', '#f97316', '#fde68a'], variant: 2 }),
            makeArt({ title: 'Gaming RGB Keyboard', label: 'Detail', palette: ['#0f172a', '#1e293b', '#38bdf8', '#e2e8f0'], variant: 3 }),
        ],
    },
    {
        name: 'Logitech MX Master 3S Wireless Mouse',
        slug: 'logitech-mx-master-3s-wireless-mouse',
        categorySlug: 'mice',
        categoryName: 'Mice',
        shortDescription: 'Ergonomic productivity mouse for precision work.',
        description: 'The MX Master 3S is positioned as the premium choice for creators and office users who need comfort, precision and quiet clicks during long sessions.',
        price: 99.99,
        compareAtPrice: 129.99,
        stock: 38,
        sold: 930,
        rating: 4.9,
        featured: true,
        bestSeller: true,
        isNew: true,
        onSale: true,
        releasedAt: '2026-05-12T08:00:00.000Z',
        tags: ['ergonomic', 'wireless', 'productivity'],
        specs: [
            { label: 'Sensor', value: '8,000 DPI' },
            { label: 'Connection', value: 'Bluetooth + Logi Bolt' },
            { label: 'Use case', value: 'Productivity' },
        ],
        images: [
            makeArt({ title: 'MX Master 3S', label: 'New', palette: ['#0f172a', '#1e293b', '#22c55e', '#bbf7d0'], variant: 2 }),
            makeArt({ title: 'MX Master 3S', label: 'Gallery', palette: ['#111827', '#334155', '#f97316', '#fde68a'], variant: 1 }),
            makeArt({ title: 'MX Master 3S', label: 'Detail', palette: ['#1e1b4b', '#312e81', '#a78bfa', '#ede9fe'], variant: 3 }),
        ],
    },
    {
        name: 'Sony WH-1000XM5 Noise Cancelling Headphones',
        slug: 'sony-wh-1000xm5-noise-cancelling-headphones',
        categorySlug: 'audio',
        categoryName: 'Audio',
        shortDescription: 'Premium headphones for work, calls and travel.',
        description: 'A flagship headset with strong noise cancelling for focused work and travel. The sound profile is smooth and comfortable for long listening sessions.',
        price: 349.99,
        compareAtPrice: 399.99,
        stock: 16,
        sold: 640,
        rating: 4.9,
        featured: true,
        bestSeller: true,
        isNew: true,
        onSale: true,
        releasedAt: '2026-05-08T08:00:00.000Z',
        tags: ['noise-cancelling', 'wireless', 'travel'],
        specs: [
            { label: 'Battery', value: '30 hours' },
            { label: 'ANC', value: 'Adaptive noise cancelling' },
            { label: 'Mic', value: 'Beamforming microphones' },
        ],
        images: [
            makeArt({ title: 'WH-1000XM5', label: 'Premium', palette: ['#0f172a', '#1e293b', '#22c55e', '#bbf7d0'], variant: 3 }),
            makeArt({ title: 'WH-1000XM5', label: 'Gallery', palette: ['#111827', '#334155', '#f97316', '#fde68a'], variant: 2 }),
            makeArt({ title: 'WH-1000XM5', label: 'Detail', palette: ['#1e1b4b', '#312e81', '#a78bfa', '#ede9fe'], variant: 1 }),
        ],
    },
    {
        name: 'Premium Desk Mat - Extended XL',
        slug: 'premium-desk-mat-extended-xl',
        categorySlug: 'accessories',
        categoryName: 'Accessories',
        shortDescription: 'Soft surface that cleans up the entire desk area.',
        description: 'A large desk mat designed to unify the look of the workstation. It makes the whole setup feel more premium while protecting the surface underneath.',
        price: 39.99,
        compareAtPrice: 49.99,
        stock: 45,
        sold: 2500,
        rating: 4.6,
        featured: false,
        bestSeller: true,
        isNew: true,
        onSale: true,
        releasedAt: '2026-05-04T08:00:00.000Z',
        tags: ['desk-mat', 'setup', 'workspace'],
        specs: [
            { label: 'Size', value: 'Extended XL' },
            { label: 'Surface', value: 'Smooth cloth' },
            { label: 'Base', value: 'Anti-slip rubber' },
        ],
        images: [
            makeArt({ title: 'Desk Mat XL', label: 'Best value', palette: ['#111827', '#334155', '#f97316', '#fdba74'], variant: 1 }),
            makeArt({ title: 'Desk Mat XL', label: 'Gallery', palette: ['#0f172a', '#1e293b', '#38bdf8', '#e2e8f0'], variant: 2 }),
            makeArt({ title: 'Desk Mat XL', label: 'Detail', palette: ['#1e1b4b', '#312e81', '#a78bfa', '#ede9fe'], variant: 3 }),
        ],
    },
    {
        name: 'USB-C Docking Station - 11 Ports',
        slug: 'usb-c-docking-station-11-ports',
        categorySlug: 'accessories',
        categoryName: 'Accessories',
        shortDescription: 'One dock to power a clean and connected workspace.',
        description: 'A high-end dock for members who use laptop setups and need one cable to connect displays, storage and accessories.',
        price: 149.99,
        compareAtPrice: 179.99,
        stock: 18,
        sold: 890,
        rating: 4.7,
        featured: true,
        bestSeller: true,
        isNew: false,
        onSale: true,
        releasedAt: '2026-05-03T08:00:00.000Z',
        tags: ['dock', 'usb-c', 'workspace'],
        specs: [
            { label: 'Ports', value: '11 total' },
            { label: 'Video', value: 'Dual display support' },
            { label: 'Power', value: '100W pass-through' },
        ],
        images: [
            makeArt({ title: 'USB-C Dock', label: 'Hub', palette: ['#1e293b', '#475569', '#38bdf8', '#dbeafe'], variant: 2 }),
            makeArt({ title: 'USB-C Dock', label: 'Gallery', palette: ['#0f172a', '#1e293b', '#22c55e', '#bbf7d0'], variant: 1 }),
            makeArt({ title: 'USB-C Dock', label: 'Detail', palette: ['#1e1b4b', '#312e81', '#a78bfa', '#ede9fe'], variant: 3 }),
        ],
    },
    {
        name: 'Wireless Charging Pad - 15W Fast Charge',
        slug: 'wireless-charging-pad-15w-fast-charge',
        categorySlug: 'accessories',
        categoryName: 'Accessories',
        shortDescription: 'Clean charging station for desk or nightstand.',
        description: 'A minimalist charging pad that keeps the desk uncluttered while still giving fast charging for supported devices.',
        price: 34.99,
        compareAtPrice: 49.99,
        stock: 61,
        sold: 1800,
        rating: 4.9,
        featured: true,
        bestSeller: true,
        isNew: false,
        onSale: true,
        releasedAt: '2026-05-02T08:00:00.000Z',
        tags: ['wireless', 'charging', 'desk'],
        specs: [
            { label: 'Output', value: '15W' },
            { label: 'Safety', value: 'Temperature protection' },
            { label: 'Design', value: 'Low-profile circle' },
        ],
        images: [
            makeArt({ title: 'Charging Pad', label: 'Fast charge', palette: ['#0f172a', '#1e293b', '#22c55e', '#bbf7d0'], variant: 1 }),
            makeArt({ title: 'Charging Pad', label: 'Gallery', palette: ['#111827', '#334155', '#f97316', '#fde68a'], variant: 2 }),
            makeArt({ title: 'Charging Pad', label: 'Detail', palette: ['#1e1b4b', '#312e81', '#a78bfa', '#ede9fe'], variant: 3 }),
        ],
    },
    {
        name: 'LED Monitor Light Bar - Auto Dimming',
        slug: 'led-monitor-light-bar-auto-dimming',
        categorySlug: 'accessories',
        categoryName: 'Accessories',
        shortDescription: 'Eye-friendly lighting for late work sessions.',
        description: 'A light bar that improves desk lighting without stealing monitor space. It is a practical premium add-on for users who work long hours at night.',
        price: 79.99,
        compareAtPrice: 99.99,
        stock: 29,
        sold: 650,
        rating: 4.8,
        featured: true,
        bestSeller: false,
        isNew: true,
        onSale: true,
        releasedAt: '2026-05-06T08:00:00.000Z',
        tags: ['lighting', 'monitor', 'workspace'],
        specs: [
            { label: 'Lighting', value: 'Auto dimming' },
            { label: 'Mount', value: 'Monitor top clamp' },
            { label: 'Modes', value: 'Warm / neutral / cool' },
        ],
        images: [
            makeArt({ title: 'Light Bar', label: 'New', palette: ['#0f172a', '#312e81', '#a78bfa', '#ede9fe'], variant: 2 }),
            makeArt({ title: 'Light Bar', label: 'Gallery', palette: ['#111827', '#334155', '#f97316', '#fde68a'], variant: 1 }),
            makeArt({ title: 'Light Bar', label: 'Detail', palette: ['#1e293b', '#475569', '#38bdf8', '#dbeafe'], variant: 3 }),
        ],
    },
];

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

const matchesSearch = (value, keyword) => String(value || '').toLowerCase().includes(keyword);

const applyProductFilters = (items, filters = {}) => {
    let results = [...items];
    const keyword = String(filters.q || filters.search || '').trim().toLowerCase();
    const categorySlugs = normalizeList(filters.category || filters.categories);

    if (keyword) {
        results = results.filter((item) => [
            item.name,
            item.shortDescription,
            item.description,
            item.categoryName,
            ...(item.tags || []),
        ].some((entry) => matchesSearch(entry, keyword)));
    }

    if (categorySlugs.length > 0) {
        results = results.filter((item) => categorySlugs.includes(item.categorySlug));
    }

    if (filters.minPrice !== undefined && filters.minPrice !== '') {
        const minPrice = Number(filters.minPrice);
        results = results.filter((item) => item.price >= minPrice);
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
        const maxPrice = Number(filters.maxPrice);
        results = results.filter((item) => item.price <= maxPrice);
    }

    const flagChecks = [
        ['inStock', (item) => item.stock > 0],
        ['bestSeller', (item) => item.bestSeller],
        ['featured', (item) => item.featured],
        ['onSale', (item) => item.onSale],
        ['isNew', (item) => item.isNew],
    ];

    flagChecks.forEach(([key, predicate]) => {
        const rawValue = filters[key];
        if (rawValue === true || rawValue === 'true' || rawValue === '1') {
            results = results.filter(predicate);
        }
    });

    const sort = filters.sort || 'featured';
    const sortMap = {
        featured: (a, b) => (Number(b.featured) - Number(a.featured)) || new Date(b.releasedAt) - new Date(a.releasedAt),
        popular: (a, b) => (b.sold - a.sold) || (b.rating - a.rating),
        newest: (a, b) => new Date(b.releasedAt) - new Date(a.releasedAt),
        priceAsc: (a, b) => a.price - b.price,
        priceDesc: (a, b) => b.price - a.price,
        rating: (a, b) => (b.rating - a.rating) || (b.sold - a.sold),
    };

    results.sort(sortMap[sort] || sortMap.featured);

    const page = Math.max(Number(filters.page) || 1, 1);
    const limit = Math.min(Math.max(Number(filters.limit) || 12, 1), 24);
    const skip = (page - 1) * limit;

    return {
        items: results.slice(skip, skip + limit).map(decorateProduct),
        total: results.length,
        page,
        limit,
        categories: mockCategories,
    };
};

const getMockProductsData = (filters = {}) => applyProductFilters(mockProducts, filters);

const getMockProductDetail = (slug) => {
    const product = mockProducts.find((item) => item.slug === slug);

    if (!product) {
        return null;
    }

    const similarProducts = mockProducts
        .filter((item) => item.categorySlug === product.categorySlug && item.slug !== product.slug)
        .slice(0, 4)
        .map(decorateProduct);

    return {
        product: decorateProduct(product),
        category: mockCategories.find((item) => item.slug === product.categorySlug) || null,
        similarProducts,
    };
};

const getMockPostsData = (filters = {}) => {
    let results = [...mockPosts];
    const keyword = String(filters.q || '').trim().toLowerCase();

    if (keyword) {
        results = results.filter((item) => [item.title, item.excerpt, item.content, ...(item.tags || [])].some((entry) => matchesSearch(entry, keyword)));
    }

    if (filters.featured === true || filters.featured === 'true' || filters.featured === '1') {
        results = results.filter((item) => item.featured);
    }

    if (filters.sort === 'oldest') {
        results.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
    } else {
        results.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    }

    const page = Math.max(Number(filters.page) || 1, 1);
    const limit = Math.min(Math.max(Number(filters.limit) || 12, 1), 24);
    const skip = (page - 1) * limit;

    return {
        items: results.slice(skip, skip + limit),
        total: results.length,
        page,
        limit,
    };
};

const getMockPostDetail = (slug) => {
    const post = mockPosts.find((item) => item.slug === slug);

    if (!post) {
        return null;
    }

    return {
        post,
        relatedPosts: mockPosts.filter((item) => item.slug !== slug && item.categorySlug === post.categorySlug).slice(0, 3),
    };
};

const getMockHomeData = (member = null) => ({
    member,
    heroPromotion: mockPromotions[0] || null,
    categories: mockCategories,
    promotions: mockPromotions,
    newestProducts: mockProducts.filter((item) => item.isNew).slice(0, 4).map(decorateProduct),
    bestSellerProducts: mockProducts.filter((item) => item.bestSeller).slice(0, 5).map(decorateProduct),
    featuredProducts: mockProducts.filter((item) => item.featured).slice(0, 4).map(decorateProduct),
    latestPosts: mockPosts.filter((item) => item.featured).slice(0, 3),
});

module.exports = {
    moneyFormatter,
    mockCategories,
    mockPromotions,
    mockPosts,
    mockProducts,
    getMockHomeData,
    getMockProductsData,
    getMockProductDetail,
    getMockPostsData,
    getMockPostDetail,
};