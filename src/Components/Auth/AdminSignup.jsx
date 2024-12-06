import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';
import logo from '../User/Assets/RimLogo.png';
import { useNavigate } from 'react-router-dom';
import baseurl from '../ApiService/ApiService';
import { Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
const AdminSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  // Validation patterns
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!emailPattern.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (!passwordPattern.test(value)) {
          error = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear API error when user starts typing
    setApiError(null);

    // Validate field and update errors
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      newErrors[key] = error;
      if (error) {
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleAdminSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await axios.post(`${baseurl}/api/admin`, {
        email: formData.email,
        password: formData.password
      });
      
      if (response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          text: 'Please log in.',
          confirmButtonText: 'Go to Login',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          navigate('/Auth/login');
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setApiError(errorMessage);
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    marginBottom: '5px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  };

  const errorStyle = {
    color: '#dc3545',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
    marginBottom: '0.5rem',
  };

  return (
    <div className="login-container adminsignup-container">
      <div className="login-form adminsignup-form">
        <h3>Admin Registration</h3>
        <form onSubmit={handleAdminSignup} noValidate>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              style={{
                ...inputStyle,
                borderColor: errors.email ? '#dc3545' : '#ddd'
              }}
              required
            />
            {errors.email && <div style={errorStyle}>{errors.email}</div>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-container">
            <input
             type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              style={{
                ...inputStyle,
                borderColor: errors.password ? '#dc3545' : '#ddd'
              }}
              required
            />
            <button
                type="button"
                className="password-toggle-button"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <div style={errorStyle}>{errors.password}</div>}
          </div>

          {apiError && <p className="error-message">{apiError}</p>}
          
          <button 
            className="login-button adminsignup-button" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="signup-link">
          <a href="/Auth/login">Back to Login</a>
        </p>
      </div>
      <div className="login-banner adminsignup-banner">
        <img src={logo} alt="Logo" className="rim-logo" />
      </div>
    </div>
  );
};

export default AdminSignup;