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

    const stepLabel = useMemo(() => (step === 1 ? 'Bước 1: Thông tin cá nhân' : 'Bước 2: Xác minh mã OTP'), [step]);

    const handleSendOtp = async (values) => {
        setSendingOtp(true);
        const res = await requestRegisterOtpApi(values);
        setSendingOtp(false);

        if (res && res.EC === 0) {
            setPendingRegister(values);
            setStep(2);
            notification.success({
                message: 'Đã gửi mã OTP',
                description: 'Vui lòng kiểm tra email của bạn để nhận mã xác thực.',
            });
            return;
        }

        notification.error({
            message: 'Không thể gửi mã OTP',
            description: res?.EM ?? 'Đã xảy ra lỗi khi gửi mã OTP!',
        });
    };

    const handleVerifyOtp = async (values) => {
        if (!pendingRegister) {
            notification.error({
                message: 'Thiếu thông tin đăng ký',
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
                description: 'Tài khoản của bạn đã được khởi tạo thành công. Vui lòng đăng nhập.',
            });
            form.resetFields();
            setPendingRegister(null);
            setStep(1);
            navigate('/login');
            return;
        }

        notification.error({
            message: 'Xác thực OTP thất bại',
            description: res?.EM ?? 'Mã OTP không chính xác hoặc đã hết hạn!',
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
            description={stepLabel}
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
            <Form form={form} name="register-form" onFinish={onFinish} autoComplete="off" layout="vertical" size="large">
                {step === 1 ? (
                    <>
                        <Form.Item
                            label="Họ và tên"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập đầy đủ họ và tên của bạn!' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn A" />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ email!' }]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="your@email.com" />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng tạo một mật khẩu!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Tạo mật khẩu của bạn" />
                        </Form.Item>
                    </>
                ) : (
                    <>
                        <Form.Item
                            label="Mã xác thực OTP"
                            name="otp"
                            rules={[{ required: true, message: 'Vui lòng nhập mã OTP đã nhận!' }]}
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
                        {step === 1 ? 'Gửi mã OTP' : 'Xác thực & Đăng ký'}
                    </Button>
                </Form.Item>
            </Form>
        </AuthLayout>
    );
};

export default RegisterPage;