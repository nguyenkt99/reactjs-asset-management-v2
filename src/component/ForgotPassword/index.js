import React, { useState } from 'react'
import { Button, Col, Form, FormControl, InputGroup, Row, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom';
import logo from '../../assets/Logo_lk.png';
import { post } from '../../httpHelper';
// import '../Login/login.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [OTP, setOTP] = useState('');
    const [isSentOTP, setIsSentOTP] = useState(false);
    const [isSentPassword, setIsSentPassword] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSendOTP = (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setErrorMessage('This field must be email. Please input email!');
            return;
        }
        setErrorMessage('');

        setIsSending(true);
        setIsResending(true);
        post('/auth/otp', { email: email })
            .then((res) => {
                if (res.status === 200) {
                    setIsSentOTP(true);
                }
            })
            .catch((error) => {
                if (error.response.status === 404) {
                    setErrorMessage('No account matching this email!');
                } else {
                    console.log('Something wrong!!!');
                }
            })
            .finally(() => {
                setIsSending(false);
                setIsResending(false);
            });
    }

    const handleSubmitOTP = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        post(`/auth/forgotPassword?OTP=${OTP}`, { email: email })
            .then((res) => {
                if (res.status === 200) {
                    setIsSentPassword(true);
                }
            })
            .catch((error) => {
                console.log(error);
                if (error.response.status === 400) {
                    setErrorMessage('Wrong OTP! Please check again');
                } else {
                    setErrorMessage('Something wrong!!!');
                }
            }).finally(() => {
                setIsSubmitting(false);
            });
    }

    const validateEmail = (email) => {
        const regexEmail = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
        return regexEmail.test(email);
    }

    const handleBack = () => {
        setIsSentOTP(false);
        setIsSubmitting(false);
        setErrorMessage('');
    }

    return (
        <div id='Login'>
            <nav className='navbar-login navbar-expand'>
                <div className='container'>
                    <div className='navbar-login__brand'>
                        <img className='navbar-login__logo' src={logo} alt="Logo login" />
                        <div className='navbar-login__title'>
                            <span>Online Asset Management</span>
                        </div>
                    </div>
                </div>
            </nav>
            <div className='container'>
                <div className='row'>
                    <div className='col-12 col-md-12'>
                        <div className='login-card'>
                            <div className='cardTitle card-container'>
                                <div className='title'>
                                    <h4 className='logintitle'>
                                        Welcome to Online Asset Management
                                    </h4>
                                </div>
                            </div>
                            <div className='cardLogin card-container'>
                                {!isSentPassword ?
                                    <Form>
                                        {isSentOTP ?
                                            <>
                                                <Row className="mt-4 mx-2">
                                                    <Form.Label>
                                                        OTP has been sent to <span style={{ fontStyle: "italic", fontWeight: "bolder" }}>{email}</span> Please check your email and enter OTP:
                                                    </Form.Label>
                                                </Row>
                                                <Row className="align-items-center justify-content-center">
                                                    <Col sm={10} className="mt-1">
                                                        <InputGroup>
                                                            <FormControl placeholder="OTP" value={OTP} onChange={(e) => setOTP(e.target.value)} />
                                                        </InputGroup>
                                                        {errorMessage &&
                                                            < Form.Control.Feedback className="d-block text-center" type="invalid">
                                                                {errorMessage}
                                                            </Form.Control.Feedback>
                                                        }
                                                    </Col>
                                                </Row>
                                                <Row className="align-items-center justify-content-center">
                                                    <Col xs="auto" className="mt-3">
                                                        {isSubmitting ?
                                                            <Button variant="danger" disabled><Spinner animation="border" size="sm" variant="light" /> Submit</Button>
                                                            :
                                                            <Button variant="danger" type="submit" onClick={handleSubmitOTP}>Submit</Button>
                                                        }
                                                    </Col>
                                                    <Col xs="auto" className="mt-3">
                                                        {isResending ?
                                                            <Button variant="outline-secondary" disabled><Spinner animation="border" size="sm" variant="dark" /> Resend</Button>
                                                            :
                                                            <Button variant="outline-secondary" type="submit" onClick={handleSendOTP}>Resend</Button>
                                                        }
                                                    </Col>
                                                </Row>
                                                <Row className="align-items-center justify-content-center">
                                                    <Col xs="auto" className="mt-2">
                                                        <Link size="sm" onClick={handleBack}>Back</Link>
                                                    </Col>
                                                </Row>
                                            </>
                                            :
                                            <>
                                                <Row className="mt-4 mx-2">
                                                    <Form.Label>
                                                        Please enter your email address:
                                                    </Form.Label>
                                                </Row>
                                                <Row className="align-items-center justify-content-center">
                                                    <Col sm={10} className="mt-1">
                                                        <InputGroup>
                                                            <FormControl style={{fontSize: "1.4rem"}} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                                        </InputGroup>
                                                        {errorMessage &&
                                                            < Form.Control.Feedback className="d-block text-center" type="invalid">
                                                                {errorMessage}
                                                            </Form.Control.Feedback>
                                                        }
                                                    </Col>
                                                </Row>
                                                <Row className="align-items-center justify-content-center">
                                                    <Col xs="auto" className="mt-3">
                                                        {isSending ?
                                                            <Button variant="danger" disabled><Spinner animation="border" size="sm" variant="light" />Send</Button>
                                                            :
                                                            <Button variant="danger" onClick={handleSendOTP}>Send</Button>
                                                        }
                                                    </Col>
                                                </Row>
                                                <Row className="align-items-center justify-content-center">
                                                    <Col xs="auto" className="mt-3">
                                                        <span style={{ fontStyle: "italic" }}>Already account? </span><Link style={{ textDecoration: "none" }} to="/login">Login here</Link>
                                                    </Col>
                                                </Row>
                                            </>
                                        }
                                    </Form>
                                    :
                                    <label className="mt-5 mx-5" style={{ fontStyle: "italic", fontWeight: "bolder" }}>Please check new password in your email. Thank you! <Link to="/login"> Login here</Link></label>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
