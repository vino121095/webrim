import React, { useState, useEffect } from 'react';
import Propic from "../User/Assets/profile-pic.png";
import AppearanceSettings from './AppearanceSettings';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import EmailSettings from './EmailSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('appearance');
  const [userData, setUserData] = useState(null);
  const [notificationSettings, setNotificationSettings] = useState({
    newsUpdate: false,
    screenNotification: false,
    message: false,
    order: false
  });

  const handleNotificationToggle = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'appearance':
        return (
          <div className="settings-content">
            <AppearanceSettings />
          </div>
        );
      case 'security':
        return (
          <div className="settings-content">
            <SecuritySettings />
          </div>
        );
      case 'notification':
        return (
          <div className="settings-content">
            <NotificationSettings 
              settings={notificationSettings}
              handleToggle={handleNotificationToggle}
            />
          </div>
        );
      case 'email':
        return (
          <div className="settings-content">
            <EmailSettings />
          </div>
        );
      default:
        return (
          <div className="settings-content">
            <AppearanceSettings />
          </div>
        );
    }
  };

  return (
    <div className="container-fluid bg-light min-h-screen">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-4 p-4">
          {/* User Info Card */}
          <div className="card border-0 shadow-sm mb-3 setting-user">
            <div className="card-body text-center rounded-3">
              <div className="d-flex align-items-center gap-3 mb-4">
                <img
                  src={Propic}
                  alt="User Avatar"
                  className="rounded-circle"
                />
                <div>
                  <h6 className="mb-0 text-white">{userData?.name || 'User Name'}</h6>
                  <small className='text-white'>{userData?.email || 'login@gmail.com'}</small>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Sidebar Card */}
          <div className="card border-0 shadow-sm">
            <div className="list-group list-group-flush setting-sidebar">
              <a 
                href="#" 
                className={`list-group-item list-group-item-action p-3`}
                onClick={() => setActiveTab('appearance')}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className=" bg-opacity-10 p-2 rounded settings-icon">
                    <i className="bi bi-palette"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Appearances</h6>
                    <small className="text-muted">Dark mode, light mode, more</small>
                  </div>
                </div>
              </a>

              <a 
                href="#" 
                className={`list-group-item list-group-item-action p-3`}
                onClick={() => setActiveTab('security')}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className=" bg-opacity-10 p-2 rounded settings-icon">
                    <i className="bi bi-shield-lock"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Security</h6>
                    <small className="text-muted">Change Password, etc</small>
                  </div>
                </div>
              </a>

              <a 
                href="#" 
                className={`list-group-item list-group-item-action p-3`}
                onClick={() => setActiveTab('notification')}
              >
                <div className="d-flex align-items-center gap-3 h-75">
                  <div className="bg-opacity-10 p-2 rounded settings-icon">
                    <i className="bi bi-bell"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Notification</h6>
                    <small>Notifications in dashboard</small>
                  </div>
                </div>
              </a>

              <a 
                href="#" 
                className={`list-group-item list-group-item-action p-3`}
                onClick={() => setActiveTab('email')}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-opacity-10 p-2 rounded settings-icon">
                    <i className="bi bi-envelope"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">E-mail</h6>
                    <small className="text-muted">Newsletter and Subscribe</small>

                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-8 p-4">
          {renderContent()}
        </div>
      </div>

      {/* Add this style to your global CSS or create a separate CSS file */}
      <style jsx>{`
        .settings-content {
          height: 500px;
          overflow-y: auto;
          padding: 15px;
          background: white;
        }

        .list-group-item.active {
          background-color: #f8f9fa;
          color: #007bff;
        }
      `}</style>
    </div>
  );
};

export default Settings;
