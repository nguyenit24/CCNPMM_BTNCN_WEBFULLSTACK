import React, { useContext, useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { loginApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { notification } from 'antd';
import BootstrapAuthLayout from '../components/auth/bootstrap-auth-layout';

const LoginPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        
        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        setValidated(true);
        setLoading(true);

        try {
            const res = await loginApi(email, password);

            if (res && res.EC === 0) {
                localStorage.setItem('access_token', res.access_token);
                if (res.refresh_token) {
                    localStorage.setItem('refresh_token', res.refresh_token);
                }

                notification.success({
                    message: 'Đăng nhập thành công',
                    description: 'Chào mừng bạn quay trở lại với TechStudio',
                });

                setAuth({
                    isAuthenticated: true,
                    user: {
                        id: res?.user?.id ?? res?.user?._id ?? '',
                        email: res?.user?.email ?? '',
                        name: res?.user?.name ?? '',
                        role: res?.user?.role ?? 'Member',
                        addresses: Array.isArray(res?.user?.addresses) ? res.user.addresses : [],
                        defaultAddress: res?.user?.defaultAddress || null,
                    },
                });

                const role = String(res?.user?.role || '').toLowerCase();
                if (role === 'admin') {
                    navigate('/admin');
                } else if (role === 'staff') {
                    navigate('/staff');
                } else {
                    navigate('/');
                }
            } else {
                notification.error({
                    message: 'Đăng nhập thất bại',
                    description: res?.EM ?? 'Email hoặc mật khẩu không chính xác!',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Đăng nhập thất bại',
                description: 'Đã xảy ra lỗi kết nối máy chủ.',
            });
        } finally {
            setLoading(false);
        }
    };

    const footer = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="bootstrap-auth-links">
                <Link to="/">
                    ← Quay lại trang chủ
                </Link>
                <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>
            <div className="text-center mt-3 text-muted" style={{ fontSize: '0.85rem' }}>
                Chưa có tài khoản? <Link to="/register" style={{ color: '#3b82f6', fontWeight: 600 }}>Đăng ký ngay</Link>
            </div>
        </div>
    );

    return (
        <BootstrapAuthLayout
            title="Đăng nhập"
            description="Đăng nhập tài khoản để mua sắm công nghệ đỉnh cao"
            footer={footer}
        >
            <Form noValidate validated={validated} onSubmit={handleSubmit} className="bootstrap-auth-form">
                <Form.Group className="mb-3" controlId="loginEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        required
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Form.Control.Feedback type="invalid">
                        Vui lòng nhập địa chỉ email hợp lệ!
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4" controlId="loginPassword">
                    <Form.Label>Mật khẩu</Form.Label>
                    <Form.Control
                        required
                        type="password"
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Form.Control.Feedback type="invalid">
                        Vui lòng nhập mật khẩu!
                    </Form.Control.Feedback>
                </Form.Group>

                <Button type="submit" className="bootstrap-auth-btn w-100" disabled={loading}>
                    {loading ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                            Đang xử lý...
                        </>
                    ) : 'Đăng nhập'}
                </Button>
            </Form>
        </BootstrapAuthLayout>
    );
};

export default LoginPage;