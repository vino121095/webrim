import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import baseurl from '../ApiService/ApiService';
import { useNavigate } from 'react-router-dom';

const SecuritySettings = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const navigate = useNavigate();

  // Email validation function
  const validateEmail = (emailToValidate) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailToValidate) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(emailToValidate)) {
      setEmailError('Invalid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Password validation function
  const validatePassword = (passwordToValidate) => {
    // At least 8 characters
    const lengthCheck = passwordToValidate.length >= 8;
    // At least one uppercase letter
    const uppercaseCheck = /[A-Z]/.test(passwordToValidate);
    // At least one lowercase letter
    const lowercaseCheck = /[a-z]/.test(passwordToValidate);
    // At least one special character
    const specialCharCheck = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordToValidate);

    let errorMessage = '';
    if (!lengthCheck) errorMessage += 'At least 8 characters. ';
    if (!uppercaseCheck) errorMessage += 'One uppercase letter. ';
    if (!lowercaseCheck) errorMessage += 'One lowercase letter. ';
    if (!specialCharCheck) errorMessage += 'One special character.';

    setPasswordError(errorMessage.trim());
    return lengthCheck && uppercaseCheck && lowercaseCheck && specialCharCheck;
  };

  // Handle email input validation on keyup
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
  };

  // Handle password input validation on keyup
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setNewPassword(newPassword);
    validatePassword(newPassword);
  };

  // Handle confirm password validation on keyup
  const handleConfirmPasswordChange = (e) => {
    const confirmPasswordValue = e.target.value;
    setConfirmPassword(confirmPasswordValue);

    if (confirmPasswordValue !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  // Main form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(newPassword);
    const isConfirmPasswordValid = newPassword === confirmPassword;

    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please correct the errors before submitting.',
        confirmButtonColor: '#F24E1E',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${baseurl}/api/admin/reset-password`, {
        email,
        newPassword,
        confirmPassword,
      });

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: response.data.message,
        confirmButtonColor: '#F24E1E',
      });

      // Clear form
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setEmailError('');
      setPasswordError('');
      setConfirmPasswordError('');

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'An error occurred while updating the password',
        confirmButtonColor: '#F24E1E',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card mb-4 p-4 border-0">
      <div className="mb-4">
        <h4 className="mb-2">Security Settings</h4>
        <p className="text-muted">Manage your account security</p>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-control ${emailError ? 'is-invalid' : ''}`}
              value={email}
              onChange={handleEmailChange}
              required
            />
            {emailError && <div className="invalid-feedback">{emailError}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className={`form-control ${passwordError ? 'is-invalid' : ''}`}
              value={newPassword}
              onChange={handlePasswordChange}
              required
            />
            {passwordError && <div className="invalid-feedback">{passwordError}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className={`form-control ${confirmPasswordError ? 'is-invalid' : ''}`}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
            />
            {confirmPasswordError && <div className="invalid-feedback">{confirmPasswordError}</div>}
          </div>
          <button
            type="submit"
            className="btn"
            style={{ background: '#F24E1E', color: 'white' }}
            disabled={isLoading}
            onClick={() => {
              if (!isLoading) {
                navigate('/Auth/login');
              }
            }}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecuritySettings;