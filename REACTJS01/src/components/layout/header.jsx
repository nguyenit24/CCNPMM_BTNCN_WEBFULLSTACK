import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Dropdown, Input, Space, Tag } from 'antd';
import { AppstoreOutlined, HomeOutlined, LoginOutlined, LogoutOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

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

        return [
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
            {
                key: 'logout',
                label: (
                    <span onClick={handleLogout}>
                        <LogoutOutlined /> Logout
                    </span>
                ),
            },
        ];
    }, [auth]);

    const avatarLetter = (auth?.user?.name || 'M').trim().charAt(0).toUpperCase();
    const showAdminLink = auth.isAuthenticated && String(auth?.user?.role || '').toLowerCase() === 'admin';

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
                <NavLink to="/products?featured=true" className={({ isActive }) => `store-nav__link ${isActive ? 'active' : ''}`}>
                    Categories
                </NavLink>
                <NavLink to="/products?onSale=true" className={({ isActive }) => `store-nav__link ${isActive ? 'active' : ''}`}>
                    Deals
                </NavLink>
                <NavLink to="/posts" className={({ isActive }) => `store-nav__link ${isActive ? 'active' : ''}`}>
                    Posts
                </NavLink>
                {showAdminLink ? (
                    <NavLink to="/admin" className={({ isActive }) => `store-nav__link ${isActive ? 'active' : ''}`}>
                        Admin
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