import React from 'react';
import PropTypes from 'prop-types';

const NotificationSettings = ({ settings, handleToggle }) => {
  return (
    <div className="card mb-4 p-4 border-0">
      <div className="mb-4">
        <h4 className="mb-2">Notification Settings</h4>
        <p className="text-muted">
        Manage your notification preferences to stay updated on important activities and alerts.
        </p>
      </div>
      <div className="card-body">
        {/* <h5 className="mb-3">Email Notifications</h5>
        <p className="text-muted">Lorem ipsum dolor sit amet consectetur.</p> */}

        <div className="list-group list-group-flush">
          {/* <div className="list-group-item d-flex justify-content-between align-items-center px-0">
            <div>
              <h6 className="mb-1">News & Update</h6>
              <small className="text-muted">
                Lorem ipsum dolor sit amet consectetur.
              </small>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input settings-checkbox"
                type="checkbox"
                checked={settings.newsUpdate}
                onChange={() => handleToggle("newsUpdate")}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div> */}

          {/* <div className="list-group-item d-flex justify-content-between align-items-center px-0">
            <div>
              <h6 className="mb-1">Screen Notification</h6>
              <small className="text-muted">
                Lorem ipsum dolor sit amet consectetur.
              </small>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input settings-checkbox"
                type="checkbox"
                checked={settings.screenNotification}
                onChange={() => handleToggle("screenNotification")}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div> */}

          {/* <div className="list-group-item d-flex justify-content-between align-items-center px-0">
            <div>
              <h6 className="mb-1">Message</h6>
              <small className="text-muted">
                Lorem ipsum dolor sit amet consectetur.
              </small>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input settings-checkbox"
                type="checkbox"
                checked={settings.message}
                onChange={() => handleToggle("message")}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div> */}

          <div className="list-group-item d-flex justify-content-between align-items-center px-0">
            <div>
              <h6 className="mb-1">Order</h6>
              <small className="text-muted">
              Enable or disable notifications for new orders.
              </small>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input settings-checkbox"
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
  );
};

NotificationSettings.propTypes = {
  settings: PropTypes.shape({
    newsUpdate: PropTypes.bool.isRequired,
    screenNotification: PropTypes.bool.isRequired,
    message: PropTypes.bool.isRequired,
    order: PropTypes.bool.isRequired,
  }).isRequired,
  handleToggle: PropTypes.func.isRequired,
};

export default NotificationSettings;