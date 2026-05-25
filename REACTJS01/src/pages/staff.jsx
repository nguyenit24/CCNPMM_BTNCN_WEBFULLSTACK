import { AuthContext } from '../components/context/auth.context';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import StaffLayout from '../components/admin/staff-layout';
import StaffOverview from '../components/admin/staff-overview';
import OrdersAdmin from '../components/admin/orders-admin';
import ProfilePage from './profile';
import { getOrdersApi, logoutApi } from '../util/api';
import { normalizeCollection } from '../components/admin/admin-utils';

const staffSectionMeta = {
    overview: {
        label: 'Overview',
        description: 'Review e-commerce store metrics and access quick shortcuts.',
    },
    profile: {
        label: 'Thông tin cá nhân',
        description: 'Xem thông tin hồ sơ của bạn và quản lý danh sách địa chỉ nhận hàng.',
    },
    orders: {
        label: 'Orders',
        description: 'Track COD orders and update delivery status through the admin panel.',
    },
};

const staffSectionComponents = {
    profile: <ProfilePage isInsideAdmin={true} />,
    orders: <OrdersAdmin />,
};

const StaffPage = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('overview');
    const [overviewLoading, setOverviewLoading] = useState(true);
    const [overviewStats, setOverviewStats] = useState({
        orders: 0,
    });

    const loadOverview = async () => {
        setOverviewLoading(true);
        try {
            const ordersRes = await getOrdersApi().catch(() => []);
            setOverviewStats({
                orders: normalizeCollection(ordersRes).length,
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

    const currentSection = staffSectionMeta[activeSection] || staffSectionMeta.overview;

    return (
        <StaffLayout
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
                <StaffOverview
                    stats={overviewStats}
                    loading={overviewLoading}
                    onOpenSection={setActiveSection}
                />
            ) : (
                <div className="admin-section-shell">{staffSectionComponents[activeSection]}</div>
            )}
        </StaffLayout>
    );
};

export default StaffPage;
