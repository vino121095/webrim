import React, { useState } from 'react';

const SecuritySettings = () => {
  const [Email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/settings/security/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          newPassword,
        }),
      });

      if (response.ok) {
        alert('Password updated successfully!');
        setEmail('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert('Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
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
              value={Email}
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
          <button type="submit" className="btn"style={{background: '#F24E1E', color: 'white'}}>
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecuritySettings;
