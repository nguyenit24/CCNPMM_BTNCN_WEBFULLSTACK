import React, { useMemo, useState } from 'react';
import { Form, Button, Spinner, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { requestRegisterOtpApi, verifyRegisterOtpApi } from '../util/api';
import { notification } from 'antd';
import BootstrapAuthLayout from '../components/auth/bootstrap-auth-layout';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    
    const [validated, setValidated] = useState(false);
    const [pendingRegister, setPendingRegister] = useState(null);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);

    const stepLabel = useMemo(() => (step === 1 ? 'Bước 1: Thông tin cá nhân' : 'Bước 2: Xác minh mã OTP'), [step]);

    const handleSendOtp = async (userData) => {
        setSendingOtp(true);
        try {
            const res = await requestRegisterOtpApi(userData);
            if (res && res.EC === 0) {
                setPendingRegister(userData);
                setStep(2);
                setValidated(false);
                notification.success({
                    message: 'Đã gửi mã OTP',
                    description: 'Vui lòng kiểm tra email của bạn để nhận mã xác thực.',
                });
            } else {
                notification.error({
                    message: 'Không thể gửi mã OTP',
                    description: res?.EM ?? 'Đã xảy ra lỗi khi gửi mã OTP!',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi hệ thống',
                description: 'Không thể gửi mã OTP. Vui lòng thử lại sau.',
            });
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async (otpCode) => {
        if (!pendingRegister) {
            notification.error({
                message: 'Thiếu thông tin đăng ký',
                description: 'Vui lòng quay lại bước đầu tiên.',
            });
            setStep(1);
            return;
        }

        setVerifyingOtp(true);
        try {
            const res = await verifyRegisterOtpApi({
                ...pendingRegister,
                otp: otpCode,
            });

            if (res && res.EC === 0) {
                notification.success({
                    message: 'Đăng ký thành công',
                    description: 'Tài khoản của bạn đã được khởi tạo thành công. Vui lòng đăng nhập.',
                });
                setName('');
                setEmail('');
                setPassword('');
                setOtp('');
                setPendingRegister(null);
                setStep(1);
                setValidated(false);
                navigate('/login');
            } else {
                notification.error({
                    message: 'Xác thực OTP thất bại',
                    description: res?.EM ?? 'Mã OTP không chính xác hoặc đã hết hạn!',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi hệ thống',
                description: 'Xác thực OTP gặp sự cố. Vui lòng thử lại.',
            });
        } finally {
            setVerifyingOtp(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        setValidated(true);

        if (step === 1) {
            await handleSendOtp({ name, email, password });
        } else {
            await handleVerifyOtp(otp);
        }
    };

    const resendOtp = async () => {
        if (!pendingRegister) return;
        await handleSendOtp(pendingRegister);
    };

    const footer = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="bootstrap-auth-links">
                <Link to="/">
                    ← Quay lại trang chủ
                </Link>
                <Link to="/login">Đăng nhập</Link>
            </div>
            <div className="text-center mt-3 text-muted" style={{ fontSize: '0.85rem' }}>
                Đã có tài khoản? <Link to="/login" style={{ color: '#3b82f6', fontWeight: 600 }}>Đăng nhập ngay</Link>
            </div>
        </div>
    );

    return (
        <BootstrapAuthLayout
            title="Đăng ký"
            description={stepLabel}
            footer={footer}
        >
            <Form noValidate validated={validated} onSubmit={handleSubmit} className="bootstrap-auth-form">
                {step === 1 ? (
                    <>
                        <Form.Group className="mb-3" controlId="registerName">
                            <Form.Label>Họ và tên</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="Ví dụ: Nguyễn Văn A"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Vui lòng nhập họ và tên của bạn!
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="registerEmail">
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

                        <Form.Group className="mb-4" controlId="registerPassword">
                            <Form.Label>Mật khẩu</Form.Label>
                            <Form.Control
                                required
                                type="password"
                                placeholder="Tạo mật khẩu của bạn"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Vui lòng tạo một mật khẩu!
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button type="submit" className="bootstrap-auth-btn w-100" disabled={sendingOtp}>
                            {sendingOtp ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Đang gửi OTP...
                                </>
                            ) : 'Gửi mã OTP'}
                        </Button>
                    </>
                ) : (
                    <>
                        <Form.Group className="mb-4 text-center" controlId="registerOtp">
                            <Form.Label className="d-block">Mã xác thực OTP</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="------"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="text-center font-monospace fs-4 py-2"
                                style={{ letterSpacing: '8px', paddingLeft: '20px' }}
                            />
                            <Form.Control.Feedback type="invalid">
                                Vui lòng nhập mã OTP gồm 6 chữ số!
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Row className="mb-4 g-2">
                            <Col xs={6}>
                                <Button variant="outline-light" className="w-100 py-2" onClick={resendOtp} disabled={sendingOtp} style={{ borderRadius: '12px' }}>
                                    {sendingOtp ? 'Đang gửi...' : 'Gửi lại OTP'}
                                </Button>
                            </Col>
                            <Col xs={6}>
                                <Button variant="outline-light" className="w-100 py-2" onClick={() => setStep(1)} style={{ borderRadius: '12px' }}>
                                    Quay lại
                                </Button>
                            </Col>
                        </Row>

                        <Button type="submit" className="bootstrap-auth-btn w-100 py-2" disabled={verifyingOtp}>
                            {verifyingOtp ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Đang xác minh...
                                </>
                            ) : 'Xác thực & Đăng ký'}
                        </Button>
                    </>
                )}
            </Form>
        </BootstrapAuthLayout>
    );
};

export default RegisterPage;