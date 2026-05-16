import React, { useContext } from 'react';
import { Button, Form, Input, notification, Space } from 'antd';
import { loginApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { ArrowLeftOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import AuthLayout from '../components/auth/auth-layout';

const LoginPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        const { email, password } = values;
        const res = await loginApi(email, password);

        if (res && res.EC === 0) {
            localStorage.setItem('access_token', res.access_token);

            notification.success({
                message: 'Đăng nhập thành công',
                description: 'Chào mừng bạn quay lại TechStudio',
            });

            setAuth({
                isAuthenticated: true,
                user: {
                    email: res?.user?.email ?? '',
                    name: res?.user?.name ?? '',
                    role: res?.user?.role ?? 'Member',
                },
            });

            navigate('/');
        } else {
            notification.error({
                message: 'Đăng nhập thất bại',
                description: res?.EM ?? 'error',
            });
        }
    };

    return (
        <AuthLayout
            title="Đăng nhập"
            footer={(
                <Space direction="vertical" size={10} className="auth-card__footer-block">
                    <div className="auth-card__links auth-card__links--single">
                        <Link to="/">
                            <ArrowLeftOutlined /> Quay lại trang chủ
                        </Link>
                        <Link to="/forgot-password">Quên mật khẩu?</Link>
                    </div>
                    <div className="auth-card__footer" style={{ textAlign: 'center' }}>
                        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                    </div>
                </Space>
            )}
        >
            <div className="auth-card__head">
                <h2 className="auth-card__title">Đăng nhập tài khoản</h2>
            </div>

            <Form form={form} name="login-form" onFinish={onFinish} autoComplete="off" layout="vertical" size="large">
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Vui lòng nhập email' }]}
                >
                    <Input prefix={<MailOutlined />} placeholder="your@email.com" />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
                </Form.Item>

                <Form.Item className="auth-form__submit">
                    <Button type="primary" htmlType="submit" block className="auth-gradient-btn">
                        Đăng nhập
                    </Button>
                </Form.Item>
            </Form>
        </AuthLayout>
    );
};

export default LoginPage;