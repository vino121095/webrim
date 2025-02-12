import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import baseurl from '../ApiService/ApiService';
import './Auth.css';
import logo from '../User/Assets/RimLogo.png';

// Create axios instance with default config
const api = axios.create({
    baseURL: baseurl,
    timeout: 15000, // 5 second timeout
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

const LoginEmail = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        phone: ''
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState(null);
    const [loading, setLoading] = useState(false);

    const validateEmail = (email) => {
        if (!email) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) ? '' : 'Please enter a valid email address';
    };

    const validatePhone = (phone) => {
        if (!phone) return 'Phone number is required';
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone) ? '' : 'Please enter a valid 10-digit phone number';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
        setServerError(null);
    };

    const validateForm = () => {
        const newErrors = {
            email: validateEmail(formData.email),
            phone: validatePhone(formData.phone)
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setServerError(null);

        try {
            const response = await api.post('/api/send-otp', {
                email: formData.email,
                phone: formData.phone
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'OTP sent successfully to your email and phone!',
                    confirmButtonText: 'OK'
                }).then(() => {
                    localStorage.setItem('verificationEmail', formData.email);
                    localStorage.setItem('verificationPhone', formData.phone);
                    navigate('/Auth/OtpVerification');
                });
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            let errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
            setServerError(errorMessage);

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h3>Welcome Back</h3>

                {serverError && (
                    <div className="server-error-banner">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="Enter your email"
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="Enter your phone number"
                            className={errors.phone ? 'error' : ''}
                        />
                        {errors.phone && <span className="error-text">{errors.phone}</span>}
                    </div>

                    <button 
                        className="login-button" 
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <span>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Sending OTP...
                            </span>
                        ) : 'Send OTP'}
                    </button>
                </form>
            </div>

            <div className="login-banner">
                <img src={logo} alt="Logo" className="rim-logo" />
            </div>
        </div>
    );
};

export default LoginEmail;
