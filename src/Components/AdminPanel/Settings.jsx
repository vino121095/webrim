import React, { useState, useEffect } from "react";
import Propic from "../User/Assets/profile-pic.png";
import AppearanceSettings from "./AppearanceSettings";
import SecuritySettings from "./SecuritySettings";
import EmailSettings from "./EmailSettings";
import { ChevronRight } from "lucide-react";
const Settings = () => {
  const [LoggedUser, setLoggedUser] = useState({});
  const [activeTab, setActiveTab] = useState('appearance');
  const [settings, setSettings] = useState({
    newsUpdate: false,
    screenNotification: false,
    message: true,
    order: false,
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    setLoggedUser(userData);
  }, []);

  console.log(LoggedUser)
  const handleToggle = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };
  const renderContent = () => {
    switch (activeTab) {
      case 'appearance':
        return <AppearanceSettings />;
      case 'security':
        return <SecuritySettings />;
      // case 'notification':
      //   return <NotificationSettings 
      //     settings={notificationSettings}
      //     handleToggle={handleNotificationToggle}
      //   />;
      case 'email':
        return <EmailSettings />;
      default:
        return <AppearanceSettings />;
    }
  };

  return (
    <div className="container-fluid bg-light min-h-screen">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-4">
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
                  <h6 className="mb-0 text-white">{LoggedUser?.username || 'User name'}</h6>
                  <small className="text-white">{LoggedUser.email}</small>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Sidebar Card */}
          <div className="card border-0 shadow-sm h-75">
            <div className="list-group list-group-flush setting-sidebar">
              <a href="#" className={`list-group-item list-group-item-action p-3 `}
               onClick={() => setActiveTab('appearance')}
              >
                <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex gap-3"> 
                  <div className="bg-opacity-10 p-2 rounded settings-icon">
                    <i className="bi bi-palette"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Appearances</h6>
                    <small className="text-muted">
                      Dark mode, light mode, more
                    </small>
                  </div>
                  </div>
                  <div><span><span><ChevronRight color="#8B9373" /></span></span></div>
                </div>
              </a>

              <a href="#"  className={`list-group-item list-group-item-action p-3 `}
                onClick={() => setActiveTab('security')}>
                <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex gap-3"> 
                  <div className=" bg-opacity-10 p-2 rounded settings-icon">
                    <i className="bi bi-shield-lock"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Security</h6>
                    <small className="text-muted">
                      Change Password, etc
                    </small>
                  </div>
                  </div>
                  <div><span><span><ChevronRight color="#8B9373"/></span></span></div>
                </div>
              </a>

              <a href="#" className={`list-group-item list-group-item-action p-3 `}
                onClick={() => setActiveTab('notification')}>
                <div className="d-flex align-items-center justify-content-between gap-3">
                  <div className="d-flex gap-3"> 
                    <div className="bg-opacity-10 p-2 rounded settings-icon">
                    <i className="bi bi-bell "></i>
                    </div>
                    <div>
                      <h6 className="mb-0">Notification</h6>
                      <small>Notifications in dashboard</small>
                    </div></div>

                  <div><span><span><ChevronRight color="#8B9373"/></span></span></div>
                </div>
              </a>

              <a href="#" className={`list-group-item list-group-item-action p-3`}
                onClick={() => setActiveTab('email')}>
                <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex gap-3"> 
                  <div className="bg-opacity-10 p-2 rounded settings-icon">
                    <i className="bi bi-envelope"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">E-mail</h6>
                    <small className="text-muted">
                      Newsletter and Subscribe
                    </small>
                  </div>
                  </div>
                  <div><span><span><ChevronRight color="#8B9373"/></span></span></div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-8">
           {renderContent()}
          {/* <div className="card p-4">
            <div className="mb-4">
              <h4 className="mb-2">Notification Settings</h4>
              <p className="text-muted">
                Lorem ipsum dolor sit amet consectetur. Hac amet nisi sem
                imperdiet nulla.
              </p>
            </div>
            <div className="card-body d-flex justify-content-between flex-wrap gap-3">
              <div> <h5 className="mb-3">Email Notifications</h5>
              <p className="text-muted">Lorem ipsum dolor sit amet consectetur.</p></div>
             
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center px-0 gap-3">
                <div className="form-check form-switch">
                    <input
                      className="form-check-input settings-checkbox"
                      type="checkbox"
                      checked={settings.newsUpdate}
                      onChange={() => handleToggle("newsUpdate")}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                  <div>
                    <h6 className="mb-1">News & Update</h6>
                    <small className="text-muted">
                      Lorem ipsum dolor sit amet consectetur.
                    </small>
                  </div>
                 
                </div>

                <div className="list-group-item d-flex justify-content-between align-items-center px-0 gap-3">
                <div className="form-check form-switch">
                    <input
                      className="form-check-input settings-checkbox"
                      type="checkbox"
                      checked={settings.screenNotification}
                      onChange={() => handleToggle("screenNotification")}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                   <div>
                    <h6 className="mb-1">Screen Notification</h6>
                    <small className="text-muted">
                      Lorem ipsum dolor sit amet consectetur.
                    </small>
                  </div>
                 
                </div>

                <div className="list-group-item d-flex justify-content-between align-items-center px-0 gap-3">
                <div className="form-check form-switch">
                    <input
                      className="form-check-input settings-checkbox"
                      type="checkbox"
                      checked={settings.message}
                      onChange={() => handleToggle("message")}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                  <div>
                    <h6 className="mb-1">Message</h6>
                    <small className="text-muted">
                      Lorem ipsum dolor sit amet consectetur.
                    </small>
                  </div>
                 
                </div>

                <div className="list-group-item d-flex justify-content-between align-items-center px-0 gap-3">
                <div className="form-check form-switch settings-checkbox">
                    <input
                      className="form-check-input settings-checkbox"
                      type="checkbox"
                      checked={settings.order}
                      onChange={() => handleToggle("order")}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                  <div>
                    <h6 className="mb-1">Order</h6>
                    <small className="text-muted">
                      Lorem ipsum dolor sit amet consectetur.
                    </small>
                  </div>
                 
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Settings;

