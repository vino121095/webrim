import React, { useEffect, useState } from "react";
import "./User.css";
import NavBar from "./NavBar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import baseurl from "../ApiService/ApiService";
import Swal from "sweetalert2";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [transports, setTransports] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [selectedTransport, setSelectedTransport] = useState('');
  const LoggedUser = JSON.parse(localStorage.getItem("userData"));
  const userId = LoggedUser?.uid;

  // Redirect non-users to login
  useEffect(() => {
    if (!LoggedUser) {
      navigate("/");
    } else if (LoggedUser.role === "admin") {
      navigate("/AdminDashboard/EnterpriseAi");
    } else if (LoggedUser.role === "technician") {
      navigate("/User/StoreDetails");
    }
  }, [navigate]);

  // Fetch cart items for the user
  useEffect(() => {
    if (userId) {
      const fetchCartData = async () => {
        try {
          const response = await axios.get(baseurl + `/api/user/${userId}`);
          const items = response.data.map((item) => ({
            ...item,
          }));
          setCartItems(items);
          calculateTotal(items);
        } catch (error) {
          console.error("Error fetching cart data:", error);
        }
      };
      fetchCartData();
    }
  }, [userId]);

  const fetchTransport = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/transport`);
      if (response.data && Array.isArray(response.data)) {
        // const validTransports = response.data.filter(
        //   (transport) => transport && typeof transport === "object"
        // );
        setTransports(response.data);
      } else {
        console.error("Invalid response format:", response.data);
        setTransports([]);
      }
    } catch (error) {
      console.error("Error fetching transports:", error);
      setTransports([]);
    }
  };
  useEffect(() => {
    fetchTransport();
  }, []);

  const handleTransportChange = (e) => {
    const selectedTid = e.target.value;
    console.log(selectedTid);
    const transport = transports.find(t => t.tid === Number(selectedTid));
    console.log(transport);
    setSelectedTransport(transport);
  };


  // Calculate total cart value
  const calculateTotal = (items) => {
    const total = items.reduce(
      (total, item) =>
        total + Number(item.product.mrp_rate || 0) * item.quantity,
      0
    );
    setTotalAmount(total);
  };

  // Handle quantity changes
  const handleQuantityChange = async (cartId, newQuantity) => {
    const updatedItems = await Promise.all(
      cartItems.map(async (item) => {
        if (item.cid === cartId) {
          try {
            await axios.put(`${baseurl}/api/update/${item.cid}`, {
              quantity: newQuantity,
            });
          } catch (error) {
            alert(
              `Error updating quantity for ${item.product_id}: ${error.message}`
            );
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );

    setCartItems(updatedItems);
    calculateTotal(updatedItems);
  };

  // Handle item removal
  const handleRemoveItem = async (cartId) => {
    try {
      await axios.delete(`${baseurl}/api/remove/${cartId}`);
      const updatedItems = cartItems.filter((item) => item.cid !== cartId);
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
    } catch (error) {
      alert(`Error removing item from cart: ${error.message}`);
    }
  };
  // Handle checkout
  const handleCheckout = async () => {
    if (!selectedTransport) {
      Swal.fire({
        icon: 'warning',
        title: 'Transport Selection Required',
        text: 'Please select a transport before proceeding to checkout.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    if (cartItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Empty Cart',
        text: 'Your cart is empty. Please add items before proceeding to checkout.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    // Calculate total order amount
  const totalOrderAmount = cartItems.reduce((total, item) => {
    return total + (item.product.mrp_rate * item.quantity);
  }, 0);

  try {
    // Fetch user's previous orders
    const orderResponse = await axios.get(
        `${baseurl}/api/userOrdersById/${LoggedUser.uid}`
    );

    const previousOrders = orderResponse.data.data;

    // Calculate the total amount from previous orders
    const previousOrderTotal = previousOrders.reduce((total, order) => {
        if (order.status !== "Cancelled" && order.status !== "Done") {
            return total + parseFloat(order.total_amount);
        }
        return total;
    }, 0);

    // Fetch user profile data to get the credit limit
    const userProfileResponse = await axios.get(
        `${baseurl}/api/userprofile/${LoggedUser.uid}`
    );
    const userProfile = userProfileResponse.data.data;

    if (!userProfile || !userProfile.current_credit_limit) {
        Swal.fire({
            icon: "error",
            title: "Credit Limit Error",
            text: "Unable to fetch user credit limit. Please try again later.",
            confirmButtonText: "OK",
            confirmButtonColor: "#d33",
        });
        return;
    }

    const userCreditLimit = parseFloat(userProfile.current_credit_limit);

    // Check if the new order plus previous orders exceed the credit limit
    if (totalOrderAmount > userCreditLimit) {
        Swal.fire({
            icon: "error",
            title: "Credit Limit Exceeded",
            text: `Your previous order value (₹${previousOrderTotal.toFixed(
                2
            )}),Current Order value(₹${totalOrderAmount}) exceeds your credit limit of ₹${userCreditLimit.toFixed(2)}.`,
            confirmButtonText: "OK",
            confirmButtonColor: "#d33",
        });
        return;
    }

    // Place the order
    await axios.post(baseurl + "/api/placeOrder", {
        user_id: LoggedUser.uid,
        transport_id: selectedTransport.tid,
    });

    // Navigate to success page after order placement
    navigate("/User/PaymentSuccess");
} catch (error) {
    console.error("Error during checkout:", error);

    Swal.fire({
        icon: "error",
        title: "Checkout Failed",
        text: "An error occurred during checkout. Please try again later.",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
    });
}

}
  return (
    <>
      <NavBar />
      <div className="container my-4">
        <h2 className="text-center mb-4">
          Your Cart: {cartItems.length} items
        </h2>
        <div className="row">
          {/* Cart Items Section */}
          <div className="col-lg-8 carttable d-none d-sm-block border">
            {/* Desktop View */}
            <table className="table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Quantity</th>
                  <th>Total Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.cid}>
                    <td className="d-flex align-items-center">
                      <img
                        src={baseurl + `/${item.product.images[0].image_path}`}
                        alt={item.name}
                        className="img-thumbnail"
                        style={{
                          width: "80px",
                          height: "80px",
                          marginRight: "10px",
                        }}
                      />
                      <div>
                        <h5 className="mb-0">{item.product.product_name}</h5>
                        <p className="text-muted mb-0">
                          {item.product.brand_name}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center justify-content-center">
                        <button
                          className="btn btn-secondary me-2"
                          onClick={() =>
                            handleQuantityChange(item.cid, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="btn btn-secondary ms-2"
                          onClick={() =>
                            handleQuantityChange(item.cid, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <i class="bi bi-currency-rupee"></i>{" "}
                      {(item.product.mrp_rate * item.quantity).toFixed(2)}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleRemoveItem(item.cid)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="col-lg-8 d-sm-none">
            {cartItems.map((item) => (
              <div key={item.cid}>
                <div className="d-flex p-2 mb-2 align-items-center">
                  <img
                    src={baseurl + `/${item.product.images[0].image_path}`}
                    alt={item.name}
                    className=""
                    style={{
                      width: "100px",
                      height: "100px",
                      marginRight: "10px",
                    }}
                  />
                  <div className="flex-grow-1 px-3">
                    <h5 className="mb-2">{item.product.product_name}</h5>
                    <p className="text-muted mb-2">{item.product.brand_name}</p>
                    <p>
                      ₹ {(item.product.mrp_rate * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <button
                      className="ms-2 mb-5 trash"
                      onClick={() => handleRemoveItem(item.cid)}
                    >
                      <i className="bi bi-trash cart-remove-item"></i>
                    </button>
                    {item.quantity < 10 ? (
                      <select
                        className="form-select"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.cid,
                            parseInt(e.target.value)
                          )
                        }
                      >
                        {[...Array(10).keys()].map((quantity) => (
                          <option key={quantity + 1} value={quantity + 1}>
                            {quantity + 1}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        className="form-control"
                        value={item.quantity}
                        min="10"
                        onChange={(e) =>
                          handleQuantityChange(
                            item.cid,
                            parseInt(e.target.value)
                          )
                        }
                      />
                    )}
                  </div>
                </div>
                <hr /> {/* Add horizontal line */}
              </div>
            ))}
          </div>

          {/* Order Summary Section */}
          <div className="col-lg-4">
      <div className="border p-4 rounded">
        <h5>Order Summary</h5>
        
        {/* Transport Dropdown */}
        <div className="mb-3">
          <label htmlFor="transportSelect" className="form-label">Select Transport</label>
          <select 
            id="transportSelect"
            className="form-select"
            value={selectedTransport ? selectedTransport.tid : ''}
            onChange={handleTransportChange} 
          >
            <option value="">Choose Transport</option>
            {transports.map((transport) => (
              <option 
                key={transport.tid} 
                value={transport.tid}
              >
                {transport.travels_name || 'Unnamed Transport'}
              </option>
            ))}
          </select>
        </div>

        <div className="d-flex justify-content-between">
          <span>Sub total</span>
          <span>{cartItems.length} items</span>
        </div>
        <div className="d-flex justify-content-between">
          <span>Total MRP</span>
          <span>
            <i className="bi bi-currency-rupee"></i> {totalAmount.toFixed(2)}
          </span>
        </div>
        <div className="d-flex justify-content-between fw-bold">
          <span>Total Cart Value</span>
          <span className="text-primary">
            <i className="bi bi-currency-rupee"></i> {totalAmount.toFixed(2)}
          </span>
        </div>
        <button
          className="btn btn-success w-100 mt-3"
          onClick={handleCheckout}
          disabled={!selectedTransport}
        >
          Checkout
        </button>
      </div>
    </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
