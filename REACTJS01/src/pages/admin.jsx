import { AuthContext } from '../components/context/auth.context';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import AdminLayout from '../components/admin/admin-layout';
import AdminOverview from '../components/admin/admin-overview';
import UsersAdmin from '../components/admin/users-admin';
import CategoriesAdmin from '../components/admin/categories-admin';
import PromotionsAdmin from '../components/admin/promotions-admin';
import ProductsAdmin from '../components/admin/products-admin';
import OrdersAdmin from '../components/admin/orders-admin';
import PostsAdmin from '../components/admin/posts-admin';
import ProfilePage from './profile';
import { getCategoriesApi, getOrdersApi, getPostsApi, getProductsApi, getPromotionsApi, getUserApi, logoutApi } from '../util/api';
import { normalizeCollection } from '../components/admin/admin-utils';

const adminSectionMeta = {
    overview: {
        label: 'Overview',
        description: 'Quickly review ExpressJS backend data and open each CRUD section by content group.',
    },
    profile: {
        label: 'Thông tin cá nhân',
        description: 'Xem thông tin hồ sơ của bạn và quản lý danh sách địa chỉ nhận hàng.',
    },
    users: {
        label: 'Users',
        description: 'Manage accounts, roles, and access permissions.',
    },
    categories: {
        label: 'Categories',
        description: 'CRUD categories synced with products and posts.',
    },
    promotions: {
        label: 'Promotions',
        description: 'CRUD banners and offers on the homepage.',
    },
    products: {
        label: 'Products',
        description: 'CRUD the full product catalog with the existing API.',
    },
    orders: {
        label: 'Orders',
        description: 'Track COD orders and update delivery status through the admin panel.',
    },
    posts: {
        label: 'Posts',
        description: 'CRUD blog and news content for the storefront.',
    },
};

const adminSectionComponents = {
    profile: <ProfilePage isInsideAdmin={true} />,
    users: <UsersAdmin />,
    categories: <CategoriesAdmin />,
    promotions: <PromotionsAdmin />,
    products: <ProductsAdmin />,
    orders: <OrdersAdmin />,
    posts: <PostsAdmin />,
};

const AdminPage = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('overview');
    const [overviewLoading, setOverviewLoading] = useState(true);
    const [overviewStats, setOverviewStats] = useState({
        users: 0,
        categories: 0,
        promotions: 0,
        products: 0,
        orders: 0,
        posts: 0,
    });

    const loadOverview = async () => {
        setOverviewLoading(true);

        try {
            const [usersRes, categoriesRes, promotionsRes, productsRes, ordersRes, postsRes] = await Promise.all([
                getUserApi().catch(() => []),
                getCategoriesApi().catch(() => []),
                getPromotionsApi().catch(() => []),
                getProductsApi({ page: 1, limit: 1 }).catch(() => ({ total: 0, items: [] })),
                getOrdersApi().catch(() => []),
                getPostsApi({ page: 1, limit: 1 }).catch(() => ({ total: 0, items: [] })),
            ]);

            setOverviewStats({
                users: normalizeCollection(usersRes).length,
                categories: normalizeCollection(categoriesRes).length,
                promotions: normalizeCollection(promotionsRes).length,
                products: Number(productsRes?.total ?? normalizeCollection(productsRes).length ?? 0),
                orders: normalizeCollection(ordersRes).length,
                posts: Number(postsRes?.total ?? normalizeCollection(postsRes).length ?? 0),
            });
        } catch (error) {
            console.error('Error loading dashboard metrics:', error);
        }

        setOverviewLoading(false);
    };

    useEffect(() => {
        loadOverview();
    }, []);

    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch (error) {
            console.log("Error logging out from server:", error);
        }

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAuth({
            isAuthenticated: false,
            user: {
                id: '',
                email: '',
                name: '',
                role: 'Member',
            },
        });
        navigate('/login');
    };

    const currentSection = adminSectionMeta[activeSection] || adminSectionMeta.overview;
    return (
        <AdminLayout
            auth={auth}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onRefresh={loadOverview}
            onLogout={handleLogout}
            refreshing={overviewLoading}
            title={currentSection.label}
            description={currentSection.description}
        >
            {activeSection === 'overview' ? (
                <AdminOverview
                    stats={overviewStats}
                    loading={overviewLoading}
                    onOpenSection={setActiveSection}
                />
            ) : (
                <div className="admin-section-shell">{adminSectionComponents[activeSection]}</div>
            )}
        </AdminLayout>
    );
};

export default AdminPage;
