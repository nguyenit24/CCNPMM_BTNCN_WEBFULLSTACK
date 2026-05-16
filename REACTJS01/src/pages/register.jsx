import React, { useMemo, useState } from 'react';
import { Button, Form, Input, notification, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import {
    requestRegisterOtpApi,
    verifyRegisterOtpApi,
} from '../util/api';
import AuthLayout from '../components/auth/auth-layout';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [step, setStep] = useState(1);
    const [pendingRegister, setPendingRegister] = useState(null);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);

    const stepLabel = useMemo(() => (step === 1 ? 'Bước 1: thông tin tài khoản' : 'Bước 2: xác thực OTP'), [step]);

    const handleSendOtp = async (values) => {
        setSendingOtp(true);
        const res = await requestRegisterOtpApi(values);
        setSendingOtp(false);

        if (res && res.EC === 0) {
            setPendingRegister(values);
            setStep(2);
            notification.success({
                message: 'Đã tạo OTP đăng ký',
                description: 'Vui lòng kiểm tra mã OTP để tiếp tục.',
            });
            return;
        }

        notification.error({
            message: 'Không thể gửi OTP',
            description: res?.EM ?? 'error',
        });
    };

    const handleVerifyOtp = async (values) => {
        if (!pendingRegister) {
            notification.error({
                message: 'Thiếu dữ liệu đăng ký',
                description: 'Vui lòng quay lại bước đầu tiên.',
            });
            setStep(1);
            return;
        }

        setVerifyingOtp(true);
        const res = await verifyRegisterOtpApi({
            ...pendingRegister,
            otp: values.otp,
        });
        setVerifyingOtp(false);

        if (res && res.EC === 0) {
            notification.success({
                message: 'Đăng ký thành công',
                description: 'Tài khoản đã được tạo, vui lòng đăng nhập.',
            });
            form.resetFields();
            setPendingRegister(null);
            setStep(1);
            navigate('/login');
            return;
        }

        notification.error({
            message: 'Xác thực OTP thất bại',
            description: res?.EM ?? 'error',
        });
    };

    const onFinish = async (values) => {
        if (step === 1) {
            await handleSendOtp(values);
            return;
        }

        await handleVerifyOtp(values);
    };

    const resendOtp = async () => {
        if (!pendingRegister) {
            return;
        }
        await handleSendOtp(pendingRegister);
    };

    return (
        <AuthLayout
            title="Đăng ký"
            footer={(
                <Space direction="vertical" size={10} className="auth-card__footer-block">
                    <div className="auth-card__links auth-card__links--single">
                        <Link to="/">
                            <ArrowLeftOutlined /> Quay lại trang chủ
                        </Link>
                        <Link to="/login">Đăng nhập</Link>
                    </div>
                    <div className="auth-card__footer" style={{ textAlign: 'center' }}>
                        Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                    </div>
                </Space>
            )}
        >
            <div className="auth-card__head">
                <h2 className="auth-card__title">{stepLabel}</h2>
            </div>

            <Form form={form} name="register-form" onFinish={onFinish} autoComplete="off" layout="vertical" size="large">
                {step === 1 ? (
                    <>
                        <Form.Item
                            label="Họ và tên"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
                        </Form.Item>

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
                            <Input.Password prefix={<LockOutlined />} placeholder="Tạo mật khẩu" />
                        </Form.Item>
                    </>
                ) : (
                    <>
                        <Form.Item
                            label="OTP xác thực"
                            name="otp"
                            rules={[{ required: true, message: 'Vui lòng nhập OTP' }]}
                        >
                            <Input.OTP length={6} />
                        </Form.Item>

                        <div className="auth-inline-actions">
                            <Button onClick={resendOtp} loading={sendingOtp}>
                                Gửi lại OTP
                            </Button>
                            <Button onClick={() => setStep(1)}>
                                Quay lại
                            </Button>
                        </div>
                    </>
                )}

                <Form.Item className="auth-form__submit">
                    <Button type="primary" htmlType="submit" block className="auth-gradient-btn" loading={sendingOtp || verifyingOtp}>
                        {step === 1 ? 'Gửi OTP' : 'Xác thực và đăng ký'}
                    </Button>
                </Form.Item>
            </Form>
        </AuthLayout>
    );
};

export default RegisterPage;