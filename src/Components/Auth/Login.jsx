import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';
import logo from '../User/Assets/RimLogo.png';
import { useNavigate } from 'react-router-dom';
import baseurl from '../ApiService/ApiService';
import { Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  // Validation Functions
  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    
    // Optional: Additional password strength checks
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return 'Password must include uppercase, lowercase, and numeric characters';
    }
    
    return '';
  };

  // Handle Input Changes with Validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    
    // Clear server error when user modifies credentials
    setServerError(null);
  };

  // Validate Entire Form
  const validateForm = () => {
    const newErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password)
    };

    setErrors(newErrors);
    
    // Return true if no errors
    return !Object.values(newErrors).some(error => error !== '');
  };
    // Toggle Password Visibility
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

  // Handle Login Submission
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Reset previous errors
    setErrors({});
    setServerError(null);
    
    // Validate Form
    if (!validateForm()) {
      return;
    }
    
    try {
      const response = await axios.post(`${baseurl}/api/loginUser`, {
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.message === 'Login successful') {
        localStorage.setItem('userData', JSON.stringify(response.data.data));
        
        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: 'Welcome back!',
          showConfirmButton: false,
          timer: 1500
        });
    
        // Navigate based on role after a short delay
        setTimeout(() => {
          if (response.data.role === 'admin') {
            navigate('/AdminDashboard/EnterpriseAi');
          }
          else if(response.data.role === 'technician'){
            navigate('/User/StoreDetails');
          }
          else {
            navigate('/');
          }
        }, 1500);
      } else {
        // Handle login failure
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Invalid email or password',
          confirmButtonText: 'Try Again',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Login failed. Please try again.',
        confirmButtonText: 'Retry',
        confirmButtonColor: '#d33'
      });
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
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleChange}
              required
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleChange}
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
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>
          
          <button 
            className="login-button" 
            type="submit"
          >
            Login
          </button>
        </form>
        
        <p className="signup-link">
        Are you a technician ? <a href="/Auth/Signup">Sign up</a>
        </p>
      </div>
      
      <div className="login-banner">
        <img src={logo} alt="Logo" className="rim-logo" />
      </div>
    </div>
  );
};

export default Login;