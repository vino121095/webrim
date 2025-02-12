import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import baseurl from '../ApiService/ApiService';
import './Auth.css';
import logo from '../User/Assets/RimLogo.png';

const OtpVerification = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    otp: ['', '', '', '', '', '']
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [timer, setTimer] = useState(600);
  const [showResend, setShowResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Constants for retry configuration
  const MAX_RETRIES = 3;
  const INITIAL_TIMEOUT = 15000; // 15 seconds
  const MAX_TIMEOUT = 30000; // 30 seconds
  useEffect(() => {
    const email = localStorage.getItem('verificationEmail');
    if (!email) {
      navigate('/Auth/LoginEmail');
      return;
    }

    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setShowResend(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, navigate]);

  const calculateTimeout = () => {
    return Math.min(INITIAL_TIMEOUT * Math.pow(2, retryCount), MAX_TIMEOUT);
  };

  const handleChange = (value, index) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (value && !/^\d+$/.test(value)) {
      return;
    }

    const newOtp = [...formData.otp];
    newOtp[index] = value;

    setFormData(prev => ({
      ...prev,
      otp: newOtp
    }));

    setErrors({});
    setServerError(null);

    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name='otp-${index + 1}']`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpValue = formData.otp.join('');
    if (otpValue.length !== 6) {
        setErrors({ otp: 'Please enter all 6 digits' });
        return;
    }

    setLoading(true);
    setServerError(null);
    const email = localStorage.getItem('verificationEmail');
    const phone = localStorage.getItem('verificationPhone');
    if (!email) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Email not found in storage',
            confirmButtonText: 'OK'
        });
        setLoading(false);
        return;
    }
    if (!phone) {
      Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Email not found in storage',
          confirmButtonText: 'OK'
      });
      setLoading(false);
      return;
  }

    try {
        const response = await axios.post(`${baseurl}/api/verify-otp`, {
          email,
          phone,
          otp: otpValue
        });
        const userData = response.data.data;
        if (response.data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Verification Successful!',
                text: 'You will be redirected shortly',
                showConfirmButton: false,
                timer: 1500
            });
            localStorage.removeItem('verificationEmail');
            localStorage.removeItem('verificationPhone');
            localStorage.setItem('userData', JSON.stringify(userData));
            
            setTimeout(() => {
                navigate('/');
            }, 1500);
        }
    } catch (error) {      
        Swal.fire({
            icon: 'error',
            title: 'Verification Failed',
            text: error?.response?.data?.message || 'Failed to verify',
            confirmButtonText: 'OK'
        });

        setFormData({ otp: ['', '', '', '', '', ''] });
        document.querySelector('input[name="otp-0"]')?.focus();
    } finally {
        setLoading(false);
        setRetryCount(0);
    }
  };

  
  const handleResend = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseurl}/api/send-otp`, {
        email: localStorage.getItem('verificationEmail'),
        phone: localStorage.getItem('verificationPhone')
      });

      if (response.data.success) {
        setShowResend(false);
        setTimer(600);
        setFormData({ otp: ['', '', '', '', '', ''] });

        Swal.fire({
          icon: 'success',
          title: 'OTP Resent!',
          text: 'Please check your email for the new code',
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Resend OTP',
          text: 'Please try again',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Resend error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to resend OTP. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h3>OTP Verification</h3>

        <p style={{ marginBottom: '20px' }}>
          Enter your verification code we just sent to your email
        </p>

        {serverError && (
          <div className="server-error-banner">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '10px',
            marginBottom: '20px'
          }}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                type="text"
                name={`otp-${index}`}
                maxLength={1}
                value={formData.otp[index]}
                onChange={(e) => handleChange(e.target.value, index)}
                disabled={loading}
                style={{
                  width: '50px',
                  height: '50px',
                  textAlign: 'center',
                  fontSize: '24px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f8f8f8'
                }}
              />
            ))}
          </div>

          {errors.otp && (
            <div className="error-text" style={{ textAlign: 'center', marginBottom: '10px' }}>
              {errors.otp}
            </div>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#F15A29' }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'center',
          gap: '5px'
        }}>
          <span>Didn't receive code?</span>
          {showResend ? (
            <button
              onClick={handleResend}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: '#F15A29',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'none'
              }}
            >
              Resend
            </button>
          ) : (
            <span>Wait {formatTime(timer)}</span>
          )}
        </div>
      </div>

      <div className="login-banner">
        <img src={logo} alt="Logo" className="rim-logo" />
      </div>
    </div>
  );
};

export default OtpVerification;
