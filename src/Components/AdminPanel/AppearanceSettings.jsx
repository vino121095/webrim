import React, { useState, useEffect } from 'react';

const AppearanceSettings = () => {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  // Apply font size when it changes
  useEffect(() => {
    // Map font sizes to base font sizes
    const fontSizeMap = {
      small: {
        base: '12px',
        h1: '1.5rem',
        h2: '1.25rem',
        h3: '1.125rem',
        h4: '1rem',
        h5: '0.875rem',
        body: '0.75rem'
      },
      medium: {
        base: '16px',
        h1: '2rem',
        h2: '1.5rem',
        h3: '1.25rem',
        h4: '1.125rem',
        h5: '1rem',
        body: '1rem'
      },
      large: {
        base: '20px',
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.75rem',
        h4: '1.5rem',
        h5: '1.25rem',
        body: '1.25rem'
      }
    };

    // Apply font sizes as CSS variables
    document.documentElement.style.setProperty('--base-font-size', fontSizeMap[fontSize].base);
    document.documentElement.style.setProperty('--h1-font-size', fontSizeMap[fontSize].h1);
    document.documentElement.style.setProperty('--h2-font-size', fontSizeMap[fontSize].h2);
    document.documentElement.style.setProperty('--h3-font-size', fontSizeMap[fontSize].h3);
    document.documentElement.style.setProperty('--h4-font-size', fontSizeMap[fontSize].h4);
    document.documentElement.style.setProperty('--h5-font-size', fontSizeMap[fontSize].h5);
    document.documentElement.style.setProperty('--body-font-size', fontSizeMap[fontSize].body);
  }, [fontSize]);

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
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
              aria-label="Enable light mode"
              title="Enable light mode"
            >
              Light Mode
            </button>
            <button
              className={`btn ${theme === 'dark' ? 'settings-theme-button' : 'btn-outline'}`}
              onClick={() => handleThemeChange('dark')}
               aria-label="Enable dark mode"
              title="Enable dark mode"
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