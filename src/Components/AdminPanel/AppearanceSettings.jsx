import React, { useState, useEffect } from 'react';

const AppearanceSettings = () => {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');
  
  const handleThemeChange = async (newTheme) => {
    try {
      const response = await fetch('http://localhost:5000/api/settings/appearance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ theme: newTheme }),
      });
      if (response.ok) {
        setTheme(newTheme);
      }
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  return (
    <div className="card mb-4 p-4 border-0">
      <div className="mb-4">
        <h4 className="mb-2">Appearance Settings</h4>
        <p className="text-muted">Customize how your dashboard looks</p>
      </div>
      <div className="card-body">
        <div className="mb-4">
          <h5 className="mb-3">Theme</h5>
          <div className="d-flex gap-3">
            <button 
              className={`btn ${theme === 'light' ? 'settings-theme-button' : 'btn-outline'}`}
              onClick={() => handleThemeChange('light')}
            >
              Light Mode
            </button>
            <button 
              className={`btn ${theme === 'dark' ? 'settings-theme-button' : 'btn-outline'}`}
              onClick={() => handleThemeChange('dark')}
            >
              Dark Mode
            </button>
          </div>
        </div>
        <div>
          <h5 className="mb-3">Font Size</h5>
          <select 
            className="form-select" 
            value={fontSize} 
            onChange={(e) => setFontSize(e.target.value)}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;