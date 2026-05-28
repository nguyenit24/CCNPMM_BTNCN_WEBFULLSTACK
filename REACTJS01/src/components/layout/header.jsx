import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Dropdown, Input, Space, Tag } from 'antd';
import { AppstoreOutlined, HomeOutlined, LoginOutlined, LogoutOutlined, SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';
import { logoutApi } from '../../util/api';

const Header = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { auth, setAuth } = useContext(AuthContext);
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        setSearchValue(searchParams.get('q') ?? '');
    }, [location.search]);

    const handleSearch = (value) => {
        const keyword = String(value || '').trim();

        if (keyword) {
            navigate(`/products?q=${encodeURIComponent(keyword)}`);
            return;
        }

        navigate('/products');
    };

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

    const menuItems = useMemo(() => {
        if (!auth.isAuthenticated) {
            return [
                {
                    key: 'login',
                    label: <Link to="/login">Login</Link>,
                    icon: <LoginOutlined />,
                },
                {
                    key: 'register',
                    label: <Link to="/register">Register</Link>,
                    icon: <AppstoreOutlined />,
                },
            ];
        }

        const items = [
            {
                key: 'profile',
                label: (
                    <Link to="/profile" className="store-account__dropdown">
                        <strong>{auth?.user?.name || 'Member'}</strong>
                        <Tag color="blue">{auth?.user?.role || 'Member'}</Tag>
                    </Link>
                ),
            },
            { type: 'divider' },
        ];

        if (String(auth?.user?.role || '').toLowerCase() !== 'admin') {
            items.push(
                {
                    key: 'orders',
                    label: <Link to="/orders">Đơn hàng của tôi</Link>,
                },
                {
                    key: 'favorites',
                    label: <Link to="/favorites">Sản phẩm yêu thích</Link>,
                },
                { type: 'divider' }
            );
        }

        items.push({
            key: 'logout',
            label: (
                <span onClick={handleLogout}>
                    <LogoutOutlined /> Logout
                </span>
            ),
        });

        return items;
    }, [auth]);

    const avatarLetter = (auth?.user?.name || 'M').trim().charAt(0).toUpperCase();
    const showAdminLink = auth.isAuthenticated && String(auth?.user?.role || '').toLowerCase() === 'admin';
    const showStaffLink = auth.isAuthenticated && String(auth?.user?.role || '').toLowerCase() === 'staff';

    return (
        <header className="store-header">
            <div className="store-header__brand">
                <div className="store-header__mark">T</div>
                <div className="store-header__brand-text">
                    <span className="store-header__title">TechStudio</span>
                    <span className="store-header__subtitle">High-end Tech Store</span>
                </div>
            </div>

            <nav className="store-nav">
                <NavLink to="/" end className={({ isActive }) => `store-nav__link ${isActive ? 'active' : ''}`}>
                    <HomeOutlined /> Home
                </NavLink>
                <NavLink to="/products" className={({ isActive }) => `store-nav__link ${isActive ? 'active' : ''}`}>
                    Products
                </NavLink>
                <NavLink to="/posts" className={({ isActive }) => `store-nav__link ${isActive ? 'active' : ''}`}>
                    Posts
                </NavLink>
                {auth.isAuthenticated && String(auth?.user?.role || '').toLowerCase() !== 'admin' ? (
                    <>
                        <NavLink to="/orders" className={({ isActive }) => `store-nav__link ${isActive ? 'active' : ''}`}>
                            Đơn hàng
                        </NavLink>
                        <NavLink to="/favorites" className={({ isActive }) => `store-nav__link ${isActive ? 'active' : ''}`}>
                            Yêu thích
                        </NavLink>
                    </>
                ) : null}
                {showAdminLink ? (
                    <NavLink to="/admin" className={({ isActive }) => `store-nav__link ${isActive ? 'active' : ''}`}>
                        Admin
                    </NavLink>
                ) : null}
                {showStaffLink ? (
                    <NavLink to="/staff" className={({ isActive }) => `store-nav__link ${isActive ? 'active' : ''}`}>
                        Staff
                    </NavLink>
                ) : null}
            </nav>

            <Input.Search
                allowClear
                className="store-header__search"
                placeholder="Search products..."
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onSearch={handleSearch}
            />

            <div className="store-header__account">
                {auth.isAuthenticated ? (
                    <Space size={10}>
                        <Button type="text" icon={<ShoppingCartOutlined />} onClick={() => navigate('/cart')} />
                        <Avatar className="store-avatar">{avatarLetter}</Avatar>
                        <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
                            <Button type="text">
                                <Space direction="vertical" size={0} align="start">
                                    <strong>{auth?.user?.name || 'Member'}</strong>
                                    <span>{auth?.user?.role || 'Member'}</span>
                                </Space>
                            </Button>
                        </Dropdown>
                    </Space>
                ) : (
                    <Button type="primary" onClick={() => navigate('/login')}>
                        Login
                    </Button>
                )}
            </div>
        </header>
    );
}

export default Header;