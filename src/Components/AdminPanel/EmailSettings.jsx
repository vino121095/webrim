import React, { useState, useEffect } from 'react';

const EmailSettings = () => {
  const [settings, setSettings] = useState({
    newsletter: false,
    promotions: false,
    updates: false,
  });

  // Uncomment and implement if you want to fetch initial settings
  // useEffect(() => {
  //   fetchEmailSettings();
  // }, []);

  // Uncomment and implement if you have a backend endpoint
  // const fetchEmailSettings = async () => {
  //   try {
  //     const response = await fetch('http://localhost:5000/api/settings/email', {
  //       credentials: 'include',
  //     });
  //     const data = await response.json();
  //     setSettings(data);
  //   } catch (error) {
  //     console.error('Error fetching email settings:', error);
  //   }
  // };

  const handleToggle = (settingKey) => {
    setSettings(prev => ({
      ...prev,
      [settingKey]: !prev[settingKey]
    }));

    // Uncomment and implement if you want to send updates to backend
    // try {
    //   const response = await fetch('http://localhost:5000/api/settings/email', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     credentials: 'include',
    //     body: JSON.stringify({
    //       [settingKey]: !settings[settingKey],
    //     }),
    //   });
    // } catch (error) {
    //   console.error('Error updating email settings:', error);
    // }
  };

  return (
    <div className="card mb-4 p-4 border-0">
      <div className="mb-4">
        <h4 className="mb-2">Email Settings</h4>
        <p className="text-muted">Manage your email preferences</p>
      </div>
      <div className="card-body">
        <div className="list-group list-group-flush">
          <div className="list-group-item d-flex justify-content-between align-items-center px-0">
            <div>
              <h6 className="mb-1">Newsletter</h6>
              <small className="text-muted">Receive our weekly newsletter</small>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input settings-checkbox"
                type="checkbox"
                checked={settings.newsletter}
                onChange={() => handleToggle('newsletter')}
                style={{ cursor: 'pointer' }}
              />
            </div>
          </div>

          <div className="list-group-item d-flex justify-content-between align-items-center px-0">
            <div>
              <h6 className="mb-1">Promotional Emails</h6>
              <small className="text-muted">Receive special offers and promotions</small>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input settings-checkbox"
                type="checkbox"
                checked={settings.promotions}
                onChange={() => handleToggle('promotions')}
                style={{ cursor: 'pointer' }}
              />
            </div>
          </div>

          <div className="list-group-item d-flex justify-content-between align-items-center px-0">
            <div>
              <h6 className="mb-1">Product Updates</h6>
              <small className="text-muted">Receive updates about our products</small>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input settings-checkbox"
                type="checkbox"
                checked={settings.updates}
                onChange={() => handleToggle('updates')}
                style={{ cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;