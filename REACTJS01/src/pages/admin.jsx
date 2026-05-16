import { AuthContext } from '../components/context/auth.context';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import AdminLayout from '../components/admin/admin-layout';
import AdminOverview from '../components/admin/admin-overview';
import UsersAdmin from '../components/admin/users-admin';
import CategoriesAdmin from '../components/admin/categories-admin';
import PromotionsAdmin from '../components/admin/promotions-admin';
import ProductsAdmin from '../components/admin/products-admin';
import PostsAdmin from '../components/admin/posts-admin';
import { getCategoriesApi, getPostsApi, getProductsApi, getPromotionsApi, getUserApi } from '../util/api';
import { normalizeCollection } from '../components/admin/admin-utils';

const sectionMeta = {
    overview: {
        label: 'Tổng quan',
        description: 'Theo dõi nhanh dữ liệu backend ExpressJS và mở từng CRUD theo từng nhóm nội dung.',
    },
    users: {
        label: 'Người dùng',
        description: 'Quản lý tài khoản, vai trò và quyền truy cập trong hệ thống.',
    },
    categories: {
        label: 'Danh mục',
        description: 'CRUD danh mục đồng bộ với sản phẩm và bài viết.',
    },
    promotions: {
        label: 'Khuyến mãi',
        description: 'CRUD banner và chương trình ưu đãi trên trang chủ.',
    },
    products: {
        label: 'Sản phẩm',
        description: 'CRUD toàn bộ catalog sản phẩm theo API hiện có.',
    },
    posts: {
        label: 'Bài viết',
        description: 'CRUD nội dung blog và tin tức cho storefront.',
    },
};

const sectionComponents = {
    users: <UsersAdmin />,
    categories: <CategoriesAdmin />,
    promotions: <PromotionsAdmin />,
    products: <ProductsAdmin />,
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
        posts: 0,
    });

    const loadOverview = async () => {
        setOverviewLoading(true);

        const [usersRes, categoriesRes, promotionsRes, productsRes, postsRes] = await Promise.all([
            getUserApi().catch(() => []),
            getCategoriesApi().catch(() => []),
            getPromotionsApi().catch(() => []),
            getProductsApi({ page: 1, limit: 1 }).catch(() => ({ total: 0, items: [] })),
            getPostsApi({ page: 1, limit: 1 }).catch(() => ({ total: 0, items: [] })),
        ]);

        setOverviewStats({
            users: normalizeCollection(usersRes).length,
            categories: normalizeCollection(categoriesRes).length,
            promotions: normalizeCollection(promotionsRes).length,
            products: Number(productsRes?.total ?? normalizeCollection(productsRes).length ?? 0),
            posts: Number(postsRes?.total ?? normalizeCollection(postsRes).length ?? 0),
        });
        setOverviewLoading(false);
    };

    useEffect(() => {
        loadOverview();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setAuth({
            isAuthenticated: false,
            user: {
                email: '',
                name: '',
                role: 'Member',
            },
        });
        navigate('/login');
    };

    const currentSection = sectionMeta[activeSection] || sectionMeta.overview;

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
                <div className="admin-section-shell">{sectionComponents[activeSection]}</div>
            )}
        </AdminLayout>
    );
};

export default AdminPage;
