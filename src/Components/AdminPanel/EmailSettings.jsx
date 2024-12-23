import React, { useState, useEffect } from 'react';

const EmailSettings = () => {
  const [settings, setSettings] = useState({
    newsletter: false,
    promotions: false,
    updates: false,
  });

  const handleToggle = (settingKey) => {
    setSettings(prev => ({
      ...prev,
      [settingKey]: !prev[settingKey]
    }));

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