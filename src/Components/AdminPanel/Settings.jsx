import React, { useState, useEffect } from 'react';
import Propic from "../User/Assets/profile-pic.png";
import AppearanceSettings from './AppearanceSettings';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import EmailSettings from './EmailSettings';
import baseurl from '../ApiService/ApiService';
import userLogo from "../User/Assets/user-logo.png";
import axios from 'axios';
const Settings = () => {
  const [activeTab, setActiveTab] = useState('appearance');
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(userLogo);
  const [notificationSettings, setNotificationSettings] = useState(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    return savedSettings 
      ? JSON.parse(savedSettings) 
      : {
        newsUpdate: false,
        screenNotification: false,
        message: false,
        order: false
      };
  });

  // Update localStorage whenever settings change
  useEffect(() => {
    // Check if any setting is true
    const hasActiveNotifications = Object.values(notificationSettings).some(value => value === true);
    
    if (hasActiveNotifications) {
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    } else {
      // Optionally remove from localStorage if all are false
      localStorage.removeItem('notificationSettings');
    }
  }, [notificationSettings]);

  useEffect(() => {
    const fetchData = async () => {
      const storedUserData = JSON.parse(localStorage.getItem('userData'));
      if (storedUserData) {
        setUserData(storedUserData);
      }

      await fetchAdminProfile(storedUserData);
    };

    fetchData();
  }, []);

  const fetchAdminProfile = async (storedUserData) => {
    if (!storedUserData || !storedUserData.aid) {
      console.error("User data not found");
      return;
    }
    
    try {
      const response = await axios.get(`${baseurl}/api/admin/${storedUserData.aid}`);
      const adminData = response.data.admin;
      if (adminData && adminData.profileimagepath) {
        setProfileImage(`${baseurl}/${adminData.profileimagepath}`);
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
    }
  };

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
            <SecuritySettings />
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
            <SecuritySettings />
          </div>
        );
      default:
        return (
          <div className="settings-content">
             <SecuritySettings />
          </div>
        );
    }
  };
console.log(profileImage);
  return (
    <div className="container-fluid bg-light min-h-screen">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-4 p-4">
          {/* User Info Card */}
          <div className="card border-0 shadow-sm mb-3 setting-user">
            <div className="card-body text-center rounded-3">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className='rounded-circle overflow-hidden d-flex justify-content-center' style={{width:'40px', height:'40px'}}>
                  <img
                  src={profileImage}
                  alt="User Avatar"
                  className='img-fluid'
                  
                /></div>
                
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
