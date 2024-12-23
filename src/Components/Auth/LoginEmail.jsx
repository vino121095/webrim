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
        email: ''
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState(null);
    const [loading, setLoading] = useState(false);

    const validateEmail = (email) => {
        if (!email) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return '';
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
            email: validateEmail(formData.email)
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
      
      const maxRetries = 2;
      let retryCount = 0;
  
      const attemptRequest = async () => {
          try {
              // Check server availability
              try {
                  await api.get('/health');
              } catch (error) {
                  if (!error.response) {
                      throw new Error('Server is not responding. Please try again later.');
                  }
              }
  
              // Proceed with OTP request
              const response = await api.post('/api/send-otp', {
                  email: formData.email
              });
  
              if (response.data.success) {
                  Swal.fire({
                      icon: 'success',
                      title: 'Success',
                      text: 'OTP sent successfully! Please check your email.',
                      confirmButtonText: 'OK'
                  }).then(() => {
                      localStorage.setItem('verificationEmail', formData.email);
                      navigate('/Auth/OtpVerification');
                  });
              }
              return true; // Success
          } catch (error) {
              console.error(`Attempt ${retryCount + 1} failed:`, error);
              
              // If we've hit max retries or it's not a timeout error, throw
              if (retryCount >= maxRetries || 
                  (error.code !== 'ECONNABORTED' && error.code !== 'ETIMEDOUT')) {
                  throw error;
              }
              
              retryCount++;
              // Wait before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              return false; // Failed, should retry
          }
      };
  
      try {
          let success = false;
          while (!success && retryCount <= maxRetries) {
              success = await attemptRequest();
          }
  
          if (!success) {
              throw new Error('Failed after maximum retry attempts');
          }
      } catch (error) {
          console.error('Error sending OTP:', error);
          
          let errorMessage;
          if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
              errorMessage = 'Request timed out. Please check your internet connection and try again.';
          } else if (error.response) {
              errorMessage = error.response.data.message || 'Failed to send OTP. Please try again.';
          } else if (error.request) {
              errorMessage = 'Server is not responding. Please try again later.';
          } else {
              errorMessage = error.message;
          }
  
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
                            onBlur={handleChange}
                            required
                            disabled={loading}
                            placeholder="Enter your email"
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && (
                            <span className="error-text">{errors.email}</span>
                        )}
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