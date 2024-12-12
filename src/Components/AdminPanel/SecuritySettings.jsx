import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import baseurl from '../ApiService/ApiService'

const SecuritySettings = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Configure axios defaults
  // axios.defaults.withCredentials = true;

  const validateEmail = async () => {
    try {
      const response = await axios.post(`${baseurl}/api/admin/search`, { email });
      if(response.data.message !== "Admin found"){
        Swal.fire({
          icon: 'error',
          title: 'Invalid Email',
          text: response.data.message,
          confirmButtonColor: '#F24E1E',
        });
        return false;
      }
      return true;
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'No admin account found with this email address.',
        confirmButtonColor: '#F24E1E',
      });
      return false;
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First validate if passwords match
      if (newPassword !== confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Password Mismatch',
          text: 'New passwords do not match!',
          confirmButtonColor: '#F24E1E',
        });
        return;
      }

      // Validate email exists
      const isValidEmail = await validateEmail();
      if (!isValidEmail) {
        return;
      }

      // Proceed with password update
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
        <form onSubmit={handlePasswordChange}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn"
            style={{background: '#F24E1E', color: 'white'}}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecuritySettings;