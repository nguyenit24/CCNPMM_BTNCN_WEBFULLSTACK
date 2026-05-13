import React, { useContext } from 'react';
import { Button, Col, Divider, Form, Input, notification, Row } from 'antd';
import { loginApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { ArrowLeftOutlined } from '@ant-design/icons';

const LoginPage = () => {

    const navigate = useNavigate();

    const { setAuth } = useContext(AuthContext);

    const onFinish = async (values) => {

        const { email, password } = values;

        const res = await loginApi(email, password);

        if (res && res.EC === 0) {

            localStorage.setItem("access_token", res.access_token);

            notification.success({
                message: "LOGIN USER",
                description: "Success"
            });

            setAuth({
                isAuthenticated: true,
                user: {
                    email: res?.user?.email ?? "",
                    name: res?.user?.name ?? "",
                    role: res?.user?.role ?? "Member"
                }
            })

            navigate("/");

        } else {

            notification.error({
                message: "LOGIN USER",
                description: res?.EM ?? "error"
            })
        }

    };

    return (
        <div className="auth-shell">
            <Row justify={"center"} style={{ width: "100%" }}>
                <Col xs={24} md={16} lg={10}>

                    <div className="auth-card">

                        <h1 className="auth-card__title">Đăng nhập</h1>
                        <p className="auth-card__subtitle">Truy cập vào cửa hàng TechStudio dành cho member.</p>

                        <Form
                            name="basic"
                            onFinish={onFinish}
                            autoComplete="off"
                            layout='vertical'
                        >

                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your email!',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your password!',
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" block>
                                    Login
                                </Button>
                            </Form.Item>

                        </Form>

                        <div className="auth-card__links">
                            <Link to={"/"}>
                                <ArrowLeftOutlined /> Quay lại trang chủ
                            </Link>
                            <Link to={"/register"}>Đăng ký tài khoản</Link>
                        </div>

                        <Divider />

                        <div className="auth-card__footer" style={{ textAlign: "center" }}>
                            Chưa có tài khoản? <Link to={"/register"}>Đăng ký tại đây</Link>
                        </div>

                    </div>

                </Col>
            </Row>
        </div>
    )
}

export default LoginPage;