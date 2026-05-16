import { Card, Statistic, Button, Space } from 'antd';
import {
    AppstoreOutlined,
    BarChartOutlined,
    FileTextOutlined,
    ShoppingOutlined,
    TeamOutlined,
} from '@ant-design/icons';

const AdminMetricCard = ({ label, value, helper, icon, color, loading }) => (
    <Card className="admin-metric-card" bordered={false}>
        <div className="admin-metric-card__icon" style={{ background: color }}>
            {icon}
        </div>
        <Statistic title={label} value={value} loading={loading} />
        <p className="admin-metric-card__helper">{helper}</p>
    </Card>
);

const AdminOverview = ({ stats, loading, onOpenSection }) => (
    <div className="admin-overview">
        <div className="admin-metrics-grid">
            <AdminMetricCard
                label="Người dùng"
                value={stats.users}
                helper="Danh sách tài khoản từ API /user"
                icon={<TeamOutlined />}
                color="linear-gradient(135deg, #2563eb, #38bdf8)"
                loading={loading}
            />
            <AdminMetricCard
                label="Danh mục"
                value={stats.categories}
                helper="Categories quản lý taxonomy"
                icon={<AppstoreOutlined />}
                color="linear-gradient(135deg, #0f766e, #34d399)"
                loading={loading}
            />
            <AdminMetricCard
                label="Khuyến mãi"
                value={stats.promotions}
                helper="Các banner active trên homepage"
                icon={<BarChartOutlined />}
                color="linear-gradient(135deg, #ea580c, #f59e0b)"
                loading={loading}
            />
            <AdminMetricCard
                label="Sản phẩm"
                value={stats.products}
                helper="Tổng số catalog product"
                icon={<ShoppingOutlined />}
                color="linear-gradient(135deg, #7c3aed, #a78bfa)"
                loading={loading}
            />
            <AdminMetricCard
                label="Bài viết"
                value={stats.posts}
                helper="Bài viết tin tức & tư vấn"
                icon={<FileTextOutlined />}
                color="linear-gradient(135deg, #14b8a6, #22c55e)"
                loading={loading}
            />
        </div>

        <div className="admin-overview__grid">
            <Card className="admin-overview__panel" bordered={false} title="Tổng hợp nhanh">
                <div className="admin-shortcuts">
                    <Button onClick={() => onOpenSection('users')}>Người dùng</Button>
                    <Button onClick={() => onOpenSection('categories')}>Danh mục</Button>
                    <Button onClick={() => onOpenSection('promotions')}>Khuyến mãi</Button>
                    <Button onClick={() => onOpenSection('products')}>Sản phẩm</Button>
                    <Button onClick={() => onOpenSection('posts')}>Bài viết</Button>
                </div>
            </Card>
        </div>
    </div>
);

export default AdminOverview;
