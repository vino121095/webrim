import React from 'react';
import { useState, useEffect, useCallback } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import axios from 'axios';
import userLogo from "../User/Assets/user-logo.png";
import notify from "../User/Assets/notify.png";
import Propic from "../User/Assets/profile-pic.png";
import hamburger from "../User/Assets/hamburger.png";
import { X, Box, Truck, LogOut } from 'lucide-react';
import { BsBoxSeam } from "react-icons/bs";
import AdminSidebar from "./AdminSideBar";
import baseurl from '../ApiService/ApiService';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminPanel.css';

const AdminNavBar = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [tab, setTab] = useState("");
  const LoggedUser = JSON.parse(localStorage.getItem("userData"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [seenNotifications, setSeenNotifications] = useState(
    JSON.parse(localStorage.getItem('seenNotifications')) || []
  );

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseurl}/api/ordersfornotify`);
      const allOrders = response.data.data || [];
      
      const relevantOrders = allOrders.filter(order => 
        order.status === 'Received' || order.status === 'Shipping'
      );
      
      // Enhanced sorting logic to prioritize new and important notifications
      const sortedOrders = relevantOrders.sort((a, b) => {
        // First, prioritize unseen notifications
        const aUnseen = !seenNotifications.includes(a.order_id);
        const bUnseen = !seenNotifications.includes(b.order_id);
        
        // If unseen status is different, prioritize unseen
        if (aUnseen !== bUnseen) {
          return aUnseen ? -1 : 1;
        }
        
        // Prioritize 'Received' status over 'Shipping'
        if (a.status !== b.status) {
          if (a.status === 'Received') return -1;
          if (b.status === 'Received') return 1;
          if (a.status === 'Shipping') return -1;
          if (b.status === 'Shipping') return 1;
        }
        
        // If both are unseen or both have been seen, sort by most recent date
        return new Date(b.order_date) - new Date(a.order_date);
      });
      
      setOrders(sortedOrders);
      
      // Calculate unread count based on unseen notifications
      const newUnreadCount = sortedOrders.filter(
        order => !seenNotifications.includes(order.order_id)
      ).length;
      
      setUnreadCount(newUnreadCount);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [seenNotifications]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Save seen notifications to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('seenNotifications', JSON.stringify(seenNotifications));
  }, [seenNotifications]);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const updateTab = () => {
      if (location.pathname.startsWith("/AdminDashboard/products")) {
        setTab("Products");
      } else if (location.pathname.startsWith("/AdminDashboard/Distributors")) {
        setTab("Distributors");
      } else if (location.pathname.startsWith("/AdminDashboard/Shipments")) {
        setTab("Shipments");
      } 
      else if(location.pathname.startsWith('/AdminDashboard/ShipmentConfirmForm')){
        setTab("Shipments");
        }
        else {
        switch (location.pathname) {
          case "/AdminDashboard":
            setTab("Enterprise Ai hub");
            break;
          case "/AdminDashboard/forum":
            setTab("Forum");
            break;
          case "/AdminDashboard/products":
            setTab("Products");
            break;
          case "/AdminDashboard/productView":
            setTab("Products View");
            break;
          case "/AdminDashboard/Distributors":
            setTab("Distributors");
            break;
          case "/AdminDashboard/technicians":
            setTab("Technicians");
            break;
          case "/AdminDashboard/OrderSummary":
            setTab("OrderSummary");
            break;
          case "/AdminDashboard/Transport":
            setTab("Transport");
            break;
          case "/AdminDashboard/Account":
            setTab("Account");
            break;
          case "/AdminDashboard/Settings":
            setTab("Settings");
            break;
          case "/AdminDashboard/EnterpriseAi":
            setTab("Enterprise Ai");
            break;
          default:
            setTab("Nothing");
            break;
        }
      }
    };

    updateTab();
  }, [location.pathname]);

  const getNotificationMessage = useCallback((order) => {
    if (order.status === 'Received') {
      return `New order received from ${order.user.username}`;
    } else if (order.status === 'Shipping') {
      return `Order ${order.order_id} is now being shipped`;
    }
  }, []);

  const getNotificationIcon = useCallback((status) => {
    switch(status) {
      case 'Received':
        return <BsBoxSeam className="text-blue-500" style={{height:'35px', width:'35px', padding:'8px'}} />;
      case 'Shipping':
        return <Truck className="text-green-500" style={{height:'35px', width:'35px', padding:'8px'}} />;
      default:
        return <Box className="w-6 h-6 text-blue-500" />;
    }
  }, []);

  const handleClickNotify = (e) => {
    e.preventDefault();
    setShowNotifications(!showNotifications);
    
    // Mark all current notifications as seen
    const newSeenNotifications = [...seenNotifications];
    orders.forEach(order => {
      if (!newSeenNotifications.includes(order.order_id)) {
        newSeenNotifications.push(order.order_id);
      }
    });
    setSeenNotifications(newSeenNotifications);
    setUnreadCount(0);
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    window.location.href = '/Auth/Login';
  };

  const NotificationButton = () => (
    <div className="position-relative">
      <button className="btn p-1" onClick={handleClickNotify}>
        <img
          src={notify}
          alt="Notifications"
          className="img-fluid"
          style={{ width: "24px", height: "24px" }}
        />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
            <span className="visually-hidden">unread notifications</span>
          </span>
        )}
      </button>
    </div>
  );

  const NotificationsPanel = () => (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-start justify-content-end"
      style={{ zIndex: 2000 }}
    >
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        onClick={() => setShowNotifications(false)}
      ></div>

      <div
        className="position-relative bg-white mt-4 mx-3 rounded shadow-lg"
        style={{ maxWidth: '500px', width: '100%' }}
      >
        <div className="p-3">
          <div className="d-flex justify-content-between align-items-center ">
            <h5 className="mb-0">Notifications</h5>
            <button
              className="btn btn-link border border-danger rounded-circle text-decoration-none p-0 text-danger"
              onClick={() => {
                setShowNotifications(false);
                setShowAllNotifications(false);
              }}
            >
              <X className="fs-5" />
            </button>
          </div>

          <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
            {loading ? (
              <div className="text-center py-3">Loading notifications...</div>
            ) : error ? (
              <div className="text-danger text-center py-3">{error}</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-3">No new order notifications</div>
            ) : (
              <>
                {orders.slice(0, showAllNotifications ? orders.length : 3).map((order) => (
                  <div
                    key={order.order_id}
                    className={`d-flex align-items-start p-3 bg-white mb-2 notification-item ${
                      !seenNotifications.includes(order.order_id) ? 'bg-light' : ''
                    }`}
                    style={{ 
                      borderLeft: !seenNotifications.includes(order.order_id) 
                        ? '4px solid #007bff' 
                        : 'none',
                      backgroundColor: !seenNotifications.includes(order.order_id) 
                        ? 'rgba(0, 123, 255, 0.1)' 
                        : 'transparent'
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-center flex-shrink-0 border rounded me-3 notification-icon"
                          style={{ width: '40px', height: '40px'}}>
                      {getNotificationIcon(order.status)}
                    </div>
                    <div className="flex-grow-1">
                      <strong className="d-block mb-1">
                        {order.status === 'Received' ? 'Order Received' : 'Order Update'}
                        {!seenNotifications.includes(order.order_id) && (
                          <span 
                            className="badge bg-primary ms-2"
                            style={{ fontSize: '0.7em' }}
                          >
                            New
                          </span>
                        )}
                      </strong>
                      <small className="text-muted">{getNotificationMessage(order)}</small>
                    </div>
                    <small className="text-muted ms-2">
                      {new Date(order.order_date).toLocaleDateString()}
                    </small>
                  </div>
                ))}

                {orders.length > 3 && !showAllNotifications && (
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const DesktopNav = () => (
    <div className="adminNav" style={{ width: "100%" }}>
      <Navbar
        expand="lg"
        className="m-0 d-flex justify-content-between align-items-center"
        style={{ border: "none", backgroundColor: "white" }}
      >
        <Navbar.Brand
          as={Link}
          to="/"
          style={{
            fontSize: "30px",
            fontWeight: "500",
            color: "#111111",
          }}
        >
          {tab}
        </Navbar.Brand>
        <Nav className="d-flex flex-row align-items-center" id="AdminNav">
          <input
            placeholder="Search Anything..."
            type="search"
            name="search"
            id="search"
            style={{
              marginRight: "15px",
              padding: "5px 10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
          <NotificationButton />
          <Nav.Link as={Link} to="/Auth/Login" data-bs-toggle="modal" data-bs-target="#logoutModal">
            <img
              src={userLogo}
              alt="logout"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "5px",
              }}
            />
          </Nav.Link>
        </Nav>
      </Navbar>
    </div>
  );

  const MobileNav = () => (
    <>
      <nav className="navbar fixed-top bg-white shadow-sm p-2">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#adminSidebar"
            aria-controls="adminSidebar"
          >
            <img
              src={hamburger}
              alt="Menu"
              className="img-fluid"
              style={{ width: "24px", height: "24px" }}
            />
          </button>

          <h6 className="mb-0 fw-medium fs-5">{tab}</h6>

          <div className="d-flex align-items-center gap-3">
            <NotificationButton />
            <div className="rounded-circle overflow-hidden" style={{ width: "40px", height: "40px" }}>
              <img
                src={Propic}
                alt="Profile"
                className="img-fluid"
              />
            </div>
          </div>
        </div>
      </nav>

      <div
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="adminSidebar"
        aria-labelledby="adminSidebarLabel"
      >
        <div className="offcanvas-header">
          <div className="p-3 d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center justify-content-between">
              <img src={Propic} alt="logo" className="img-fluid" />
              <span><h6 className="mb-0 ms-3">{LoggedUser?.email}</h6></span>
            </div>
            <div>
              <button
                type="button"
                className="btn text-white"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span><i className="bi bi-chevron-left text-white"></i></span> Back
              </button>
            </div>
          </div>
        </div>
        <div className="offcanvas-body">
          <AdminSidebar handleBackClick={() => setIsSidebarOpen(false)} />
        </div>
      </div>
    </>
  );
  return (
    <>
      {isSidebarOpen && (
        <div className="">
          <AdminSidebar handleBackClick={() => setIsSidebarOpen(false)} />
        </div>
      )}
      <div className="container-fluid adminSidebar-container">
        {screenWidth > 768 ? <DesktopNav /> : <MobileNav />}
      </div>
      {showNotifications && <NotificationsPanel />}
      
      <div
        className="modal"
        id="logoutModal"
        tabIndex="-1"
        aria-labelledby="logoutModalLabel"
        aria-hidden="true"
        data-bs-backdrop="false"
      >
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content logout-modal-content" style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
            {/* <div className="modal-header">
              <h5 className="modal-title" id="logoutModalLabel">
                Confirm Logout
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div> */}
            <div className="modal-body mt-4">
              <div className="text-center mb-4">
                <p className="" style={{ color: "#0024FF" }}>
                  <LogOut size={50} />
                </p>
                <p className="fw-bold fs-lg" style={{ color: "#0024FF", fontSize: '24px'}}>Log Out</p>
                <p className="text-muted mb-0">
                  Hi {LoggedUser?.email || "User@email.com"}
                </p>
              </div>
            </div>
            <div className="text-center d-flex justify-content-center align-items-center flex-column mb-4">
              <button
                type="button"
                className="btn btn-light w-50 mb-3 py-2"
                data-bs-dismiss="modal"
              >
                No
              </button>
              <button
                type="button"
                className="btn btn-danger mb-3 w-50 py-2 logout-btn"
                onClick={handleLogout}
                data-bs-dismiss="modal"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminNavBar;