import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./NavBar";
import axios from "axios";
import baseurl from "../ApiService/ApiService";
import { useNavigate } from "react-router-dom";
import './User.css'

const OrderHistory = () => {
  const navigate = useNavigate();
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const LoggedUser = JSON.parse(localStorage.getItem("userData"));
  useEffect(() => {
    const LoggedUser = JSON.parse(localStorage.getItem("userData"));
    if (!LoggedUser) {
      navigate("/");
    } else if (LoggedUser.role === "admin") {
      navigate("/AdminDashboard/EnterpriseAi");
    }
    else if (LoggedUser.role === "technician") {
      navigate('/User/StoreDetails');
    }
  }, [navigate]); // Removed LoggedUser from dependency array

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${baseurl}/api/userOrdersById/${LoggedUser.uid}`
        );
        setOrders(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrderItems = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="container py-5 text-center">
          <h2>Order History</h2>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <div className="container py-5 text-center">
          <h2>Order History</h2>
          <p className="text-danger">Error: {error}</p>
          <p>Please try again later.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container py-5">
        <h2 className="text-center mb-4">Order History</h2>
        {orders.length === 0 ? (
          <p className="text-center text-muted">No orders found.</p>
        ) : (
          <div className="table-container" style={{overflowX:'scroll', whiteSpace:'nowrap'}}>
          <table className="table table-hover table-bordered">
            <thead className="table-primary">
              <tr>
                <th>#</th>
                <th>Order ID</th>
                <th>Total Quantity</th>
                <th>Order Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Transport</th>
                <th>Courier ID</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const totalQuantity = order.OrderItems.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                );

                return (
                  <React.Fragment key={order.oid}>
                    <tr
                      onClick={() => toggleOrderItems(order.oid)}
                      className="table-row"
                    >
                      <td>{index + 1}</td>
                      <td>{order.order_id}</td>
                      <td>{totalQuantity}</td>
                      <td>{order.order_date}</td>
                      <td>{order.total_amount}</td>
                      <td>{order.status ? order.status : "Pending"}</td>
                      <td>{order.transport_name ? order.transport_name : "Not Shipping"}</td>
                      <td>{order.courier_id ? order.courier_id : "Not Shipping"}</td>
                    </tr>
                    {expandedOrderId === order.oid && (
                      <tr>
                        <td colSpan="9">
                          <div className="accordion accordion-flush">
                            {order.OrderItems.map((item, idx) => (
                              <div
                                key={idx}
                                className="d-flex justify-content-between py-2 border-bottom"
                              >
                                <div>
                                  <h6 className="mb-1">{item.Product.product_name}</h6>
                                  <small className="text-muted">
                                    Quantity: {item.quantity}
                                  </small>
                                </div>
                                <div>
                                  <p className="mb-0">
                                    <strong>Price:</strong> {item.price}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          </div>

        )}
      </div>
    </>
  );
};

export default OrderHistory;
