import React, { useState } from "react";
import "./AdminPanel.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState as useStateHook, useEffect } from "react";
import { CircleUserRound, Settings, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import Logo from "../User/Assets/RimLogo.png";
import Enterprise from "../User/Assets/Enterprise ai.png";
import Forum from "../User/Assets/forum.png";
import Order from "../User/Assets/Order summary.png";
import Product from "../User/Assets/Product.png";
import Shipments from "../User/Assets/Shipment.png";
import Technician from "../User/Assets/Technicians.png";
import Distributor from "../User/Assets/Distributors.png";
import Transport from "../User/Assets/Transport.png";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const AdminSideBar = ({ handleBackClick }) => {
  const LoggedUser = JSON.parse(localStorage.getItem("userData"));
  const navigate = useNavigate();
  const location = useLocation();
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 768);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleNavigation = (path, e) => {
    e.preventDefault();
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    window.location.href = '/Auth/Login';
  };

  const toggleProductsDropdown = () => {
    setIsProductsOpen(!isProductsOpen);
  };

  return (
    <>
     {isLargeScreen ? (
      <div className="sideNavContainer bg-light d-flex flex-column">
        {/* Logo Section */}
        <div className="Dashboardlogo p-3">
          <img
            src={Logo}
            alt="logo"
            className="img-fluid"
            style={{ width: "211px", height: "102px" }}
          />
        </div>

        {/* Navigation Links */}
        <div className="sideNavLinks px-3">
          {/* General Links */}
          <div className="general text-muted mt-4 fw-bold">General</div>
          <ul className="list-unstyled generalLinks mt-2 ps-2">
            <li className="mb-2">
              <a
                href="/AdminDashboard/EnterpriseAi"
                onClick={(e) => handleNavigation("/AdminDashboard/EnterpriseAi", e)}
                className="d-flex align-items-center py-2 text-dark text-decoration-none"
              >
                <img src={Enterprise} alt="" className="me-3" /> Enterprise AI
                Hub
              </a>
            </li>
            <li className="mb-2">
              <a
                href="/AdminDashboard/forum"
                onClick={(e) => handleNavigation("/AdminDashboard/forum", e)}
                className="d-flex align-items-center py-2 text-dark text-decoration-none"
              >
                <img src={Forum} alt="" className="me-3" /> Forum
              </a>
            </li>
            <li className="mb-2">
              <div 
                className="d-flex align-items-center justify-content-between py-2 text-dark text-decoration-none cursor-pointer"
                onClick={toggleProductsDropdown}
              >
                <div className="d-flex align-items-center product-nav-link">
                  <img src={Product} alt="" className="me-3" /> 
                  Products
                </div>
                {isProductsOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
              {isProductsOpen && (
                <ul className="list-unstyled pl-4">
                  <li className="mb-4 mt-3 ms-5">
                    <a
                      href="/AdminDashboard/products"
                      onClick={(e) => handleNavigation('/AdminDashboard/products', e)}
                      className="text-dark text-decoration-none"
                    >
                      Product List
                    </a>
                  </li>
                  <li className="mb-3 ms-5">
                    <a
                      href="/AdminDashboard/productView"
                      onClick={(e) => handleNavigation('/AdminDashboard/productView', e)}
                      className="text-dark text-decoration-none"
                    >
                      Product View
                    </a>
                  </li>
                </ul>
              )}
            </li>
            <li className="mb-2">
              <a
                href="/AdminDashboard/technicians"
                onClick={(e) =>
                  handleNavigation("/AdminDashboard/technicians", e)
                }
                className="d-flex align-items-center py-2 text-dark text-decoration-none"
              >
                <img src={Technician} alt="" className="me-3" /> Technicians
              </a>
            </li>
            <li className="mb-2">
              <a
                href="/AdminDashboard/Distributors"
                onClick={(e) =>
                  handleNavigation("/AdminDashboard/Distributors", e)
                }
                className="d-flex align-items-center py-2 text-dark text-decoration-none"
              >
                <img src={Distributor} alt="" className="me-3" /> Distributors
              </a>
            </li>
            <li className="mb-2">
              <a
                href="/AdminDashboard/Shipments"
                onClick={(e) =>
                  handleNavigation("/AdminDashboard/Shipments", e)
                }
                className="d-flex align-items-center py-2 text-dark text-decoration-none"
              >
                <img src={Shipments} alt="" className="me-3" /> Shipments
              </a>
            </li>
            <li className="mb-2">
              <a
                href="/AdminDashboard/Transport"
                onClick={(e) =>
                  handleNavigation("/AdminDashboard/Transport", e)
                }
                className="d-flex align-items-center py-2 text-dark text-decoration-none"
              >
                <img src={Transport} alt="" className="me-3" /> Transport
              </a>
            </li>
            <li className="mb-2">
              <a
                href="/AdminDashboard/OrderSummary"
                onClick={(e) =>
                  handleNavigation("/AdminDashboard/OrderSummary", e)
                }
                className="d-flex align-items-center py-2 text-dark text-decoration-none"
              >
                <img src={Order} alt="" className="me-3" /> Order Summary
              </a>
            </li>
          </ul>

          {/* Support Links */}
          <div className="support text-muted mt-5 fw-bold">Support</div>
          <ul className="list-unstyled supportLinks mt-2 ps-2">
            <li className="mb-2">
              <a
                href="/AdminDashboard/Account"
                className="d-flex align-items-center py-2 text-dark text-decoration-none"
                onClick={(event) => handleNavigation('/AdminDashboard/Account', event)}
              >
                <CircleUserRound className="me-3" /> Accounts
              </a>
            </li>
            <li className="mb-2">
              <a
                href="/AdminDashboard/Settings"
                className="d-flex align-items-center py-2 text-dark text-decoration-none"
                onClick={(event) => handleNavigation('/AdminDashboard/Settings', event)}
              >
                <Settings className="me-3" /> Settings
              </a>
            </li>
            <li className="mb-2">
              <a
                href=""
                className="d-flex align-items-center py-2 text-dark text-decoration-none"
                data-bs-toggle="modal"
                data-bs-target="#logoutModal"
              >
                <LogOut className="me-3" /> Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
      ) : (
      <div className="" style={{ width: '100%' }}>
        {/* Small Screen Navigation */}
        <div className="p-3">
          {/* General Links */}
          <div className="text-white small fw-bold mb-3">General</div>
          <nav className="nav flex-column">
            <a
              href="#"
              onClick={(event) => handleNavigation('/AdminDashboard/EnterpriseAi', event)}
              className="nav-link text-white d-flex align-items-center mb-2"
              data-bs-dismiss="offcanvas"
            >
              <i className="bi bi-box me-3 text-white"></i> Enterprise AI Hub
            </a>

            <a
              href="#"
              onClick={(event) => handleNavigation('/AdminDashboard/forum', event)}
              className="nav-link text-white d-flex align-items-center mb-2"
              data-bs-dismiss="offcanvas"
            >
              <i className="bi bi-chat-square-text me-3 text-white"></i> Forum
            </a>

            {/* Products Dropdown */}
            <div className="dropdown">
              <div
                className="nav-link text-white d-flex align-items-center mb-2 border-0 bg-transparent w-100 justify-content-between"
                onClick={toggleProductsDropdown}
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-box-seam me-3 text-white"></i> Products
                </div>
                {isProductsOpen ? (
                  <ChevronUp color="white" size={16} />
                ) : (
                  <ChevronDown color="white" size={16} />
                )}
              </div>
              {isProductsOpen && (
                <ul className="list-unstyled pl-4 ms-5">
                  <li className="mb-4">
                    <a
                      className="text-white text-decoration-none"
                      href="#"
                      data-bs-dismiss="offcanvas"
                      onClick={(event) => handleNavigation('/AdminDashboard/products', event)}
                    >
                      Product List
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-white text-decoration-none"
                      href="#"
                      data-bs-dismiss="offcanvas"
                      onClick={(event) => handleNavigation('/AdminDashboard/productView', event)}
                    >
                      Product View
                    </a>
                  </li>
                </ul>
              )}
            </div>

            <a
              href="#"
              onClick={(event) => handleNavigation('/AdminDashboard/technicians', event)}
              className="nav-link text-white d-flex align-items-center mb-2"
              data-bs-dismiss="offcanvas"
            >
              <i className="bi bi-people me-3 text-white"></i> Technicians
            </a>

            <a
              href="#"
              onClick={(event) => handleNavigation('/AdminDashboard/Distributors', event)}
              className="nav-link text-white d-flex align-items-center mb-2"
              data-bs-dismiss="offcanvas"
            >
              <i className="bi bi-people me-3 text-white"></i> Distributors
            </a>

            <a
              href="#"
              onClick={(event) => handleNavigation('/AdminDashboard/Shipments', event)}
              className="nav-link text-white d-flex align-items-center mb-2"
              data-bs-dismiss="offcanvas"
            >
              <i className="bi bi-truck me-3 text-white"></i> Shipments
            </a>

            <a
              href="#"
              onClick={(event) => handleNavigation('/AdminDashboard/Transport', event)}
              className="nav-link text-white d-flex align-items-center mb-2"
              data-bs-dismiss="offcanvas"
            >
              <i className="bi bi-truck me-3 text-white"></i> Transport
            </a>

            <a
              href=""
              onClick={(event) => handleNavigation('/AdminDashboard/OrderSummary', event)}
              className="nav-link text-white d-flex align-items-center mb-2"
              data-bs-dismiss="offcanvas"
            >
              <i className="bi bi-cart me-3 text-white"></i> Order Summary
            </a>
          </nav>

          {/* Support Links */}
          <div className="text-white small fw-bold mt-4 mb-3">Support</div>
          <nav className="nav flex-column">
            <a 
              href="" 
              className="nav-link text-white d-flex align-items-center mb-2"
              data-bs-dismiss="offcanvas" 
              onClick={(event) => handleNavigation('/AdminDashboard/Account', event)}
            >
              <i className="bi bi-person-circle me-3 text-white"></i> Accounts
            </a>

            <a 
              href="AdminDashboard/Settings" 
              className="nav-link text-white d-flex align-items-center mb-2"
              data-bs-dismiss="offcanvas"  
              onClick={(event) => handleNavigation('/AdminDashboard/Settings', event)}
            >
              <i className="bi bi-gear me-3 text-white"></i> Settings
            </a>

            <a 
              href="#" 
              className="nav-link text-white d-flex align-items-center mb-2"
              data-bs-dismiss="offcanvas" 
              data-bs-toggle="modal"
              data-bs-target="#logoutModal"
            >
              <i className="bi bi-box-arrow-right me-3 text-white"></i> Logout
            </a>
          </nav>
        </div>
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
      </div>
     )}
    </>
  );
};

export default AdminSideBar;