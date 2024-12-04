import React from 'react';
import { useState, useEffect } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import userLogo from "../User/Assets/user-logo.png";
import notify from "../User/Assets/notify.png";
import Propic from "../User/Assets/profile-pic.png";
import hamburger from "../User/Assets/hamburger.png";
import { X, Box, MessageCircle, LogOut } from 'lucide-react';
import AdminSidebar from "./AdminSideBar";
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminPanel.css';

const AdminNavBar = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [tab, setTab] = useState("");
  const LoggedUser = JSON.parse(localStorage.getItem("userData"));

  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'Order Received',
      message: 'Lorem ipsum dolor sit amet consectetur. Eget gravida nisl faucibus egestas.'
    },
    {
      id: 2,
      type: 'order',
      title: 'Order Received',
      message: 'Lorem ipsum dolor sit amet consectetur. Eget gravida nisl faucibus egestas.'
    },
    {
      id: 3,
      type: 'complaint',
      title: 'Complaint',
      message: 'Lorem ipsum dolor sit amet consectetur. Eget gravida nisl faucibus egestas.'
    },
    {
      id: 4,
      type: 'order',
      title: 'Order Received',
      message: 'Lorem ipsum dolor sit amet consectetur. Eget gravida nisl faucibus egestas.'
    },
    {
      id: 5,
      type: 'order',
      title: 'Order Received',
      message: 'Lorem ipsum dolor sit amet consectetur. Eget gravida nisl faucibus egestas.'
    }
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'order':
        return <Box className="w-6 h-6 text-blue-500" />;
      case 'complaint':
        return <MessageCircle className="w-6 h-6 text-blue-500" />;
      default:
        return <Box className="w-6 h-6 text-blue-500" />;
    }
  };

  const handleClickNotify = (e) => {
    e.preventDefault(); 
    setShowNotifications(!showNotifications);
  };
  const handleHamburgerClick = () => {
    console.log("clicked");
    setIsSidebarOpen(true);
  };
  const handleLogout = () => {
    localStorage.removeItem('userData');
    window.location.href = '/Auth/Login';
  };

  const handleBackClick = () => {
    setIsSidebarOpen(false);
  };

  const handleNavigation = (path, e) => {
    e.preventDefault();
    // Add navigation logic here
    console.log(`Navigating to ${path}`);
    setIsSidebarOpen(false); // Close sidebar after navigation
  };

  useEffect(() => {
    // Update screen width when window is resized
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Update the `tab` based on the current pathname
    if (location.pathname.startsWith("/AdminDashboard/products")) {
      setTab("Products");
    } else if (location.pathname.startsWith("/AdminDashboard/Distributors")) {
      setTab("Distributors");
    }else if (location.pathname.startsWith("/AdminDashboard/Shipments")) {
      setTab("Shipments");
    } else {
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
  }, [location.pathname]);

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
          <Nav.Link as={Link} to="" style={{ marginRight: '10px' }} onClick={handleClickNotify}>
            <img
              src={notify}
              alt="notify"
              style={{ marginTop: "7px" }}
            />
          </Nav.Link>
          <Nav.Link as={Link} to="/Auth/Login" data-bs-toggle="modal"
        data-bs-target="#logoutModal">
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
            <button className="btn p-1" onClick={handleClickNotify}>
              <img
                src={notify}
                alt="Notifications"
                className="img-fluid"
                style={{ width: "24px", height: "24px" }}
              />
            </button>

            <div className="rounded-circle overflow-hidden"  style={{ width: "40px", height: "40px" }}>
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
          {/* <h5 className="offcanvas-title" id="adminSidebarLabel">Menu</h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            onClick={handleBackClick}
          ></button> */}
          <div className="p-3 d-flex align-items-center justify-content-between w-100">
          <div className='d-flex align-items-center justify-content-between'><img src={Propic} alt="logo" className="img-fluid" />
          <span><h6 className='mb-0 ms-3'>{LoggedUser.email}</h6></span></div>
          <div>
            
            <button
            type="button"
            className='btn text-white'
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            onClick={handleBackClick}
          ><span><i className="bi bi-chevron-left text-white"></i></span> Back</button></div>
          
        </div>
        </div>
        <div className="offcanvas-body">
          <AdminSidebar handleBackClick={handleBackClick} />
        </div>
      </div>
    </>
  );

  return (
    <>
      {isSidebarOpen && (
        <div className=''>
          <AdminSidebar handleBackClick={handleBackClick} />
        </div>
      )}
      <div className='container-fulid adminSidebar-container'>
        {screenWidth > 768 ? <DesktopNav /> : <MobileNav />}
      </div>
      <div
        className="modal"
        id="logoutModal"
        tabIndex="-1"
        aria-labelledby="logoutModalLabel"
        aria-hidden="true"
        // data-bs-backdrop="false"
      >
         <div className="modal-dialog modal-dialog-centered modal-sm">
          <div
            className="modal-content logout-modal-content"
            style={{
              height: "300px",
              display: "flex",
              justifyContent: "center",
            }}
          >
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
      {showNotifications && (
  <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-start justify-content-end" style={{ zIndex: 2000 }}>
    {/* Semi-transparent background overlay */}
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
      onClick={() => setShowNotifications(false)}
    ></div>

    {/* Notification panel */}
    <div className="position-relative bg-white mt-4 mx-3 rounded shadow-lg" style={{ maxWidth: '500px', width: '100%' }}>
      <div className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 mb-0">Notification</h2>
          <button
            className="btn btn-link border border-danger rounded-circle text-decoration-none p-0 text-danger"
            onClick={() => setShowNotifications(false)}
          >
            <X className="fs-5" />
          </button>
        </div>

        <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="d-flex align-items-start p-3 bg-white mb-2 notification-item"
            >
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0 border rounded me-3 notification-icon"
                style={{ width: '40px', height: '40px'}}
              >
                {getIcon(notification.type)}
              </div>

              <div className="flex-grow-1">
                <p className="mb-1 fw-bold">{notification.title}</p>
                <p className="mb-0 text-muted">{notification.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}
    </>
  );
};

export default AdminNavBar;