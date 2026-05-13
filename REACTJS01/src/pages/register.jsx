import React from 'react';
import { Button, Col, Divider, Form, Input, notification, Row } from 'antd';
import { createUserApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const RegisterPage = () => {

    const navigate = useNavigate();

    const onFinish = async (values) => {

        const { name, email, password } = values;

        const res = await createUserApi(name, email, password);

        if (res) {

            notification.success({
                message: "CREATE USER",
                description: "Success"
            });

            navigate("/login");

        } else {

            notification.error({
                message: "CREATE USER",
                description: "error"
            })
        }

    };

    return (
        <div className="auth-shell">
            <Row justify={"center"} style={{ width: "100%" }}>
                <Col xs={24} md={16} lg={10}>

                    <div className="auth-card">

                        <h1 className="auth-card__title">Đăng ký</h1>
                        <p className="auth-card__subtitle">Tạo tài khoản member để truy cập trang chủ và xem sản phẩm.</p>

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

                            <Form.Item
                                label="Name"
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your name!',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" block>
                                    Submit
                                </Button>
                            </Form.Item>

                        </Form>

                        <div className="auth-card__links">
                            <Link to={"/"}>
                                <ArrowLeftOutlined /> Quay lại trang chủ
                            </Link>
                            <Link to={"/login"}>Đăng nhập</Link>
                        </div>

                        <Divider />

                        <div className="auth-card__footer" style={{ textAlign: "center" }}>
                            Đã có tài khoản? <Link to={"/login"}>Đăng nhập</Link>
                        </div>

                    </div>

                </Col>
            </Row>
        </div>
    )
}

export default RegisterPage;