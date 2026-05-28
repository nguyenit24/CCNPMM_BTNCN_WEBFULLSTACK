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

    const stepLabel = useMemo(() => (step === 1 ? 'Step 1: Personal Information' : 'Step 2: OTP Verification'), [step]);

    const handleSendOtp = async (userData) => {
        setSendingOtp(true);
        try {
            const res = await requestRegisterOtpApi(userData);
            if (res && res.EC === 0) {
                setPendingRegister(userData);
                setStep(2);
                setValidated(false);
                notification.success({
                    message: 'OTP Sent',
                    description: 'Please check your email for the verification code.',
                });
            } else {
                notification.error({
                    message: 'Could Not Send OTP',
                    description: res?.EM ?? 'An error occurred while sending the OTP code!',
                });
            }
        } catch (error) {
            notification.error({
                message: 'System Error',
                description: 'Could not send OTP. Please try again later.',
            });
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async (otpCode) => {
        if (!pendingRegister) {
            notification.error({
                message: 'Missing Registration Data',
                description: 'Please go back to the first step.',
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
                    message: 'Registration Successful',
                    description: 'Your account has been created successfully. Please sign in.',
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
                    message: 'OTP Verification Failed',
                    description: res?.EM ?? 'Incorrect or expired OTP code!',
                });
            }
        } catch (error) {
            notification.error({
                message: 'System Error',
                description: 'OTP verification failed. Please try again.',
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
                    ← Back to Home
                </Link>
                <Link to="/login">Sign In</Link>
            </div>
            <div className="text-center mt-3" style={{ fontSize: '0.85rem' }}>
                Already have an account? <Link to="/login" style={{ color: '#3b82f6', fontWeight: 600 }}>Sign In now</Link>
            </div>
        </div>
    );

    return (
        <BootstrapAuthLayout
            title="Register"
            description={stepLabel}
            footer={footer}
        >
            <Form noValidate validated={validated} onSubmit={handleSubmit} className="bootstrap-auth-form">
                {step === 1 ? (
                    <>
                        <Form.Group className="mb-3" controlId="registerName">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="e.g., John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Please enter your full name!
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="registerEmail">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                required
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Please enter a valid email address!
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="registerPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                required
                                type="password"
                                placeholder="Create your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Please create a password!
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button type="submit" className="bootstrap-auth-btn w-100" disabled={sendingOtp}>
                            {sendingOtp ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Sending OTP...
                                </>
                            ) : 'Send OTP Code'}
                        </Button>
                    </>
                ) : (
                    <>
                        <Form.Group className="mb-4 text-center" controlId="registerOtp">
                            <Form.Label className="d-block text-start">OTP Verification Code</Form.Label>
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
                                Please enter the 6-digit OTP code!
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Row className="mb-4 g-2">
                            <Col xs={6}>
                                <Button variant="outline-light" className="w-100 py-2" onClick={resendOtp} disabled={sendingOtp} style={{ borderRadius: '12px' }}>
                                    {sendingOtp ? 'Sending...' : 'Resend OTP'}
                                </Button>
                            </Col>
                            <Col xs={6}>
                                <Button variant="outline-light" className="w-100 py-2" onClick={() => setStep(1)} style={{ borderRadius: '12px' }}>
                                    Back
                                </Button>
                            </Col>
                        </Row>

                        <Button type="submit" className="bootstrap-auth-btn w-100 py-2" disabled={verifyingOtp}>
                            {verifyingOtp ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Verifying...
                                </>
                            ) : 'Verify & Register'}
                        </Button>
                    </>
                )}
            </Form>
        </BootstrapAuthLayout>
    );
};

export default RegisterPage;