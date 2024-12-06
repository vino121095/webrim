import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import notify from "../User/Assets/notify.png";
import RIM from "../User/Assets/RimLogo.png";
import UserLogo from "../User/Assets/user-logo.png";
import hamburger from "../User/Assets/hamburger.png";
import ProfilePic from "../User/Assets/user-logo.png";
import axios from "axios";
import Swal from "sweetalert2";
import baseurl from "../ApiService/ApiService";
import { useNavigate } from "react-router-dom";
import { X, Info } from 'lucide-react';
import { MdOutlineLogout, MdLogin, MdShoppingCart, MdAccountCircle, MdHistory, MdLogout } from "react-icons/md";
import { LuUserCircle } from "react-icons/lu";

const NavBar = () => {
  const [isToggleUserDropdown, setToggleUserDropdown] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loggedUser, setLoggedUser] = useState({});
  const navigate = useNavigate();
  const [location, setLocation] = useState("Fetching location...");
  const [ismap, setMap] = useState({});
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    const userData = JSON.parse(localStorage.getItem("userData"));
    setLoggedUser(userData);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${loggedUser.role === 'distributor' ? 
        `${baseurl}/api/forumtakens/${loggedUser.uid}` : `${baseurl}/api/forumtakes/${loggedUser.uid}` }`);
      
      // Transform API data into notification format
      const apiNotifications = response.data.data.map(item => ({
        id: item.takeId,
        type: 'forum', // You can adjust this based on your needs
        title: `Forum Taken: ${item.takeId}`,
        message: `Taken by ${item?.forumOwnerId || item.distributorName} at ${new Date(item.takenAt).toLocaleString()}`,
        details: item // Keep full item details if needed
      }));

      setNotifications(apiNotifications);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications when component mounts or when needed
  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  // notifications = [
  //   { id: 1, type: "order", title: "Order Received", message: "Order #123 has been received." },
  //   { id: 2, type: "complaint", title: "Complaint", message: "New complaint received." },
  //   { id: 3, type: "order", title: "Order Update", message: "Order #124 has been shipped." },
  // ];

  const handleClickNotify = () => setShowNotifications(!showNotifications);

  const toggleUserDropdown = () => setToggleUserDropdown(!isToggleUserDropdown);

  const toggleMobileDropdown = () => setIsMobileDropdownOpen(!isMobileDropdownOpen);

  const handleShowDetails = (notification) => {
    setSelectedNotification(notification);
  };
  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("userData");
        navigate("/Auth/Login");
        Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          text: 'You have been logged out successfully!',
          confirmButtonText: 'OK'
        });
      }
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case "taken":
        return <i className="bi bi-box-seam text-primary"></i>;
      case "complete":
        return <i className="bi bi-exclamation-circle text-warning"></i>;
      default:
        return <i className="bi bi-info-circle text-secondary"></i>;
    }
  };

  useEffect(() => {
    const fetchCurrentLocation = async() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            setMap({
              latitude,
              longitude
            })
            console.log(latitude)
            console.log(longitude)
  
            try {
              const apiKey = 'a3317655231447b6b370288bb881de3f';
              const response = await axios.get(
                `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`
              );
  
              if (response.data.results.length > 0) {
                const components = response.data.results[0].components;
                console.log('Location Components:', components);
  
                const city = components.city;
                const state = components.state;
                const country = components.country;
                const county = components.county;
  
                const district = city || county || "Location not found";
                const stateName = state || "State not available";
                const countryName = country || "Country not available";
  
                setLocation(`${district}, ${stateName}, ${countryName}`);
  
                // Check if Google Maps is loaded
                if (window.google && window.google.maps) {
                  const mapOptions = {
                    center: { lat: latitude, lng: longitude },
                    zoom: 14,
                  };
  
                  const mapElement = document.getElementById("map");
                  if (mapElement) {
                    const newMap = new window.google.maps.Map(mapElement, mapOptions);
                    
                    new window.google.maps.Marker({
                      position: { lat: latitude, lng: longitude },
                      map: newMap,
                      title: "Your Location",
                    });
                  }
                }
              } else {
                setLocation("Location not found");
              }
            } catch (error) {
              console.error("Detailed geocoding error:", {
                message: error.message,
                response: error.response,
                request: error.request
              });
              setLocation("Unable to fetch location");
            }
          },
          (error) => {
            console.error("Geolocation error:", {
              code: error.code,
              message: error.message
            });
            setLocation("Unable to fetch location");
          }
        );
      } else {
        setLocation("Geolocation not supported by your browser");
      }
    };
  
    fetchCurrentLocation();
  }, []); // Empty dependency array
const handleMoveToMain = ()=>{
  navigate('/')
}
  return (
    <nav>
      {screenWidth > 768 ? (
        <div className="navbar py-2 container-fluid">
          <div className="d-flex align-items-center position-absolute start-0 ms-4">
            <a href="" className="text-decoration-none">
              <i className="bi bi-geo-alt-fill text-danger"></i>{" "}
              <span style={{ color: "black" }}>{location}</span>
              <div id="map"></div>
            </a>
          </div>

          <div className="d-flex align-items-center justify-content-center w-100">
            <a href="/">
              <img src={RIM} alt="RIM Logo" style={{ height: "50px" }} />
            </a>
          </div>

          <div className="d-flex align-items-center gap-3 position-absolute end-0 me-4">
            <img
              src={notify}
              style={{ width: "24px", height: "24px", cursor: "pointer" }}
              alt="Notifications"
              onClick={handleClickNotify}
            />
            <img
              src={UserLogo}
              alt="Profile"
              onClick={toggleUserDropdown}
              style={{
                height: "50px",
                width: "50px",
                objectFit: "cover",
                cursor: "pointer",
              }}
            />
            {isToggleUserDropdown && (
              <div
                className="dropdown-menu show position-absolute"
                style={{ top: "60px", right: "0" }}
              >
                {!loggedUser ? (
                  <a className="dropdown-item" href="/Auth/Login">
                    <MdLogin className="me-2" />
                    Login
                  </a>
                ) : (
                  <>
                    {loggedUser.role === "technician" && (
                      <a className="dropdown-item" href="/User/ProfileInfo">
                        <LuUserCircle className="me-2" />
                        Profile
                      </a>
                    )}
                    {loggedUser.role === "distributor" && (
                      <>
                        <a className="dropdown-item" href="/User/OrderHistory">
                          <MdShoppingCart className="me-2" />
                          Orders
                        </a>
                        <a className="dropdown-item" href="/User/ProfileInfo">
                          <LuUserCircle className="me-2" />
                          Profile
                        </a>
                      </>
                    )}
                    <a href="#"
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <MdOutlineLogout className="me-2" />
                      Logout
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Mobile Navigation Bar */}
          <div className="Mob-nav bg-white d-flex justify-content-between align-items-center px-3 py-2 container-fluid">
            {/* Hamburger Menu Button */}
            <button
              className="navbar-toggler border-0"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#userSidebar"
              aria-controls="userSidebar"
            >
              <img
                src={hamburger}
                alt="Menu"
                className="img-fluid"
                style={{ width: "24px", height: "24px" }}
              />
            </button>

            {/* Mobile Logo */}
            <div className="d-flex align-items-center justify-content-center w-100"onClick={handleMoveToMain}>
            <img src={RIM} alt="RIM Logo" className="mobile-logo"  />
            </div>
            <div className="d-flex align-items-center gap-3 position-absolute end-0 me-3">
              {" "}
              <img
                src={notify}
                alt="Notifications"
                onClick={handleClickNotify}
                style={{ cursor: "pointer" }}
              />
              {/* Profile Picture */}
              <img
                src={ProfilePic}
                alt="Profile"
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                }}
              />
            </div>
          </div>

          {/* Offcanvas Sidebar */}
          <div
            className="offcanvas offcanvas-start"
            tabIndex="-1"
            id="userSidebar"
            aria-labelledby="userSidebarLabel"
          >
            <div className="offcanvas-header">
              {/* Back Button */}
              <div className="p-3 d-flex align-items-center justify-content-between w-100">
                <div className='d-flex align-items-center justify-content-between' ><img src={ProfilePic} style={{ width: '50px', height: '50px' }} alt="logo" className="rounded-circle" />
                  <span><h6 className='mb-0 ms-3'>{loggedUser?.username || 'Guest user'}</h6></span></div>
                <div>
                  <button
                    type="button"
                    className='btn text-white'
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                  ><span><i className="bi bi-chevron-left text-white"></i></span> Back</button></div>

              </div>
            </div>
            <div className="offcanvas-body ms-3">
              {/* Sidebar Content */}
              <div className="text-white small fw-bold mb-3">Menu</div>
              <ul className="list-unstyled mt-3">
                {/* Login Link (if no loggedUser) */}
                {!loggedUser ? (
                  <li className="py-2">
                    <a
                      href="/Auth/Login"
                      className="text-white text-decoration-none px-3 d-flex align-items-center pe-auto"
                    >
                      <MdLogin className="me-2" /> {/* Login Icon */}
                      Login
                    </a>
                  </li>
                ) : (
                  <>
                    {/* Profile Link for Technicians */}
                    {loggedUser.role === "technician" && (
                      <li className="py-2">
                        <a
                          href="/User/ProfileInfo"
                          className="text-white text-decoration-none px-3 d-flex align-items-center"
                        >
                          <MdAccountCircle className="me-2" /> {/* Profile Icon */}
                          Profile
                        </a>
                      </li>
                    )}
                    {/* Order History and Profile Links for Distributors */}
                    {loggedUser.role === "distributor" && (
                      <>
                        <li className="py-2">
                          <a
                            href="/User/OrderHistory"
                            className="text-white text-decoration-none px-3 d-flex align-items-center"
                          >
                            <MdHistory className="me-2" /> {/* Orders Icon */}
                            Orders
                          </a>
                        </li>
                        <li className="py-2">
                          <a
                            href="/User/ProfileInfo"
                            className="text-white text-decoration-none px-3 d-flex align-items-center"
                          >
                            <MdAccountCircle className="me-2" /> {/* Profile Icon */}
                            Profile
                          </a>
                        </li>
                      </>
                    )}
                    {/* Logout Link */}
                    <li className="py-2">
                      <a
                        href="/"
                        className="text-white text-decoration-none px-3 d-flex align-items-center"
                        onClick={handleLogout}
                      >
                        <MdLogout className="me-2" /> {/* Logout Icon */}
                        Logout
                      </a>
                    </li>
                  </>
                )}
              </ul>

            </div>

          </div>
        </div>
      )}
       {showNotifications && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-start justify-content-end"
    style={{ zIndex: 2000 }}
  >
    {/* Semi-transparent background overlay */}
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
      onClick={() => setShowNotifications(false)}
    ></div>

    {/* Notification panel */}
    <div
      className="position-relative bg-white mt-4 mx-3 rounded shadow-lg"
      style={{ maxWidth: '500px', width: '100%' }}
    >
      <div className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Notifications</h5>
          <button
            className="btn btn-link border border-danger rounded-circle text-decoration-none p-0 text-danger"
            onClick={() => {
              setShowNotifications(false);
              setShowAllNotifications(false); 
              setSelectedNotification(null);
            }}
          >
            <X className="fs-5" />
          </button>
        </div>

        {/* Notification Details Modal */}
        {selectedNotification && (
          <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Notification Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedNotification(null)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <tbody>
                        <tr>
                          <th className="col-4">Owner Name</th>
                          <td>{selectedNotification.details?.forumOwnerId || selectedNotification.details.distributorName}</td>
                        </tr>
                        <tr>
                          <th>Phone</th>
                          <td>{selectedNotification.details?.forumOwnerPhone || selectedNotification.details.distributorPhone}</td>
                        </tr>
                        <tr>
                          <th>Email</th>
                          <td>{selectedNotification.details?.forumOwnerEmail || selectedNotification.details.distributorEmail}</td>
                        </tr>
                        <tr>
                          <th>Address</th>
                          <td>{selectedNotification.details?.forumOwnerAddress || selectedNotification.details.distributorAddress}</td>
                        </tr>
                        <tr>
                          <th>Taken At</th>
                          <td>{new Date(selectedNotification.details.takenAt).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
          {loading ? (
            <div className="text-center py-3">Loading notifications...</div>
          ) : error ? (
            <div className="text-danger text-center py-3">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-3">No notifications</div>
          ) : (
            <>
              {notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className="d-flex align-items-start p-3 mb-2 border-bottom position-relative"
                >
                  <div className="flex-grow-1">
                    <strong className="d-block mb-1">{notification.title}</strong>
                    <small className="text-muted">{notification.message}</small>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-info ms-2"
                    onClick={() => handleShowDetails(notification)}
                  >
                    <Info size={16} />
                  </button>
                </div>
              ))}

              {notifications.length > 3 && !showAllNotifications && (
                <div className="text-center py-3">
                  <button
                    className="btn"
                    style={{
                      backgroundColor: "orangered",
                      color: "white",
                      border: "none",
                    }}
                    onClick={() => setShowAllNotifications(true)}
                  >
                    View More
                  </button>
                </div>
              )}

              {showAllNotifications &&
                notifications.slice(3).map((notification) => (
                  <div
                    key={notification.id}
                    className="d-flex align-items-start p-3 mb-2 border-bottom position-relative"
                  >
                    <div className="flex-grow-1">
                      <strong className="d-block mb-1">{notification.title}</strong>
                      <small className="text-muted">{notification.message}</small>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-info ms-2"
                      onClick={() => handleShowDetails(notification)}
                    >
                      <Info size={16} />
                    </button>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  </div>
)}
    </nav>
  );
};

export default NavBar;