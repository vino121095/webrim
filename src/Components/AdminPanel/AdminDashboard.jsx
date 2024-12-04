import React from 'react'
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavBar";
import AdminSidebar from "./AdminSideBar";
import ProductList from "./ProductList";
import ProductView from "./ProductView";
import ProductViewDetails from "./ProductViewDetails";
import Forum from "./Forum";
import Technicians from "./Technicians";
import OrderSummary from "./OrderSummary";
import Distributors from "./Distributors";
import Shipments from "./Shipments"
import ShipmentsDetails from "./ShipmentsDetails";
import ShipmentConfirmForm from "./ShipmentConfirmForm";
import DistributorsViewDetails from "./DistributorsViewDetails";
import ExpertiseAiHub from './EnterpriseAi';
import Transport from "./Transport";
import Account from "./Account";
import Settings from "./Settings";
import './AdminPanel.css'

const AdminDashboard = () => {
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const navigate = useNavigate();
  const LoggedUser = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    if (!LoggedUser || LoggedUser.role !== 'admin') {
      navigate('/Auth/Login');
    }
  }, [LoggedUser, navigate]);
  
  useEffect(() => {
    // Update screen width when window is resized
    const handleResize = () => setScreenWidth(window.innerWidth);

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
    <div className="container-fluid d-flex p-0 admin-container">
        {screenWidth > 768 ? (
          <div className="admin-dashboard-container d-none d-md-block">
            <AdminSidebar />
          </div>
        ) : (
          <div></div>
        )}
        <div className="adminSideNav d-flex flex-column flex-grow-1">
          <AdminNavbar />
          <main className="content-area p-4 admin-content-area">
            <div className="">
              <Routes>
                <Route path='EnterpriseAi' element={<ExpertiseAiHub/>} />
                <Route path="products" element={<ProductList />} />
                <Route path="productView" element={<ProductView />} />
                <Route
                  path="products/productViewDetails/:id"
                  element={<ProductViewDetails />}
                />
                <Route path="Forum" element={<Forum />} />
                <Route path="distributors" element={<Distributors />} />
                <Route
                  path="Distributors/DistributorsViewDetails/:id"
                  element={<DistributorsViewDetails />}
                />
                <Route path="technicians" element={<Technicians />} />
                <Route path="Transport" element={<Transport />} />
                <Route path="OrderSummary" element={<OrderSummary />} />
                <Route path="Shipments" element={<Shipments />} />
                <Route path="Shipments/:id" element={<ShipmentsDetails />} />
                <Route path="ShipmentConfirmForm/:id" element={<ShipmentConfirmForm />} />
                <Route path="Account" element={<Account />} />
                <Route path="Settings" element={<Settings />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
  </>
  )
}

export default AdminDashboard