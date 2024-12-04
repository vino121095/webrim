import React, { useState } from "react";
import Propic from "../User/Assets/profile-pic.png";
const Settings = () => {
  const [settings, setSettings] = useState({
    newsUpdate: false,
    screenNotification: false,
    message: true,
    order: false,
  });

  const handleToggle = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
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
                  <h6 className="mb-0">User Name</h6>
                  <small>login@gmail.com</small>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Sidebar Card */}
          <div className="card border-0 shadow-sm">
            <div className="list-group list-group-flush setting-sidebar">
              <a href="#" className="list-group-item list-group-item-action p-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-danger bg-opacity-10 p-2 rounded">
                    <i className="bi bi-palette text-danger"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Appearances</h6>
                    <small className="text-muted">
                      Dark mode, light mode, more
                    </small>
                  </div>
                </div>
              </a>

              <a href="#" className="list-group-item list-group-item-action p-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-danger bg-opacity-10 p-2 rounded">
                    <i className="bi bi-shield-lock text-danger"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Security</h6>
                    <small className="text-muted">
                      Change Password, etc
                    </small>
                  </div>
                </div>
              </a>

              <a href="#" className="list-group-item list-group-item-action p-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-danger bg-opacity-10 p-2 rounded">
                    <i className="bi bi-bell text-danger"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Notification</h6>
                    <small>Notifications in dashboard</small>
                  </div>
                </div>
              </a>

              <a href="#" className="list-group-item list-group-item-action p-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-danger bg-opacity-10 p-2 rounded">
                    <i className="bi bi-envelope text-danger"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">E-mail</h6>
                    <small className="text-muted">
                      Newsletter and Subscribe
                    </small>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-8 p-4">
          <div className="card mb-4 p-4">
            <div className="mb-4">
              <h4 className="mb-2">Notification Settings</h4>
              <p className="text-muted">
                Lorem ipsum dolor sit amet consectetur. Hac amet nisi sem
                imperdiet nulla.
              </p>
            </div>
            <div className="card-body">
              <h5 className="mb-3">Email Notifications</h5>
              <p className="text-muted">Lorem ipsum dolor sit amet consectetur.</p>

              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div>
                    <h6 className="mb-1">News & Update</h6>
                    <small className="text-muted">
                      Lorem ipsum dolor sit amet consectetur.
                    </small>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.newsUpdate}
                      onChange={() => handleToggle("newsUpdate")}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>

                <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div>
                    <h6 className="mb-1">Screen Notification</h6>
                    <small className="text-muted">
                      Lorem ipsum dolor sit amet consectetur.
                    </small>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.screenNotification}
                      onChange={() => handleToggle("screenNotification")}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>

                <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div>
                    <h6 className="mb-1">Message</h6>
                    <small className="text-muted">
                      Lorem ipsum dolor sit amet consectetur.
                    </small>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.message}
                      onChange={() => handleToggle("message")}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>

                <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div>
                    <h6 className="mb-1">Order</h6>
                    <small className="text-muted">
                      Lorem ipsum dolor sit amet consectetur.
                    </small>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.order}
                      onChange={() => handleToggle("order")}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

