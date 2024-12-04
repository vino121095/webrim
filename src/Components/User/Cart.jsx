import React, { useEffect, useState } from "react";
import "./User.css"; 
import NavBar from "./NavBar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import baseurl from "../ApiService/ApiService";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]); 
  const [totalAmount, setTotalAmount] = useState(0); 
  const LoggedUser = JSON.parse(localStorage.getItem("userData")); 
  const userId = LoggedUser?.uid; 

  // Redirect non-users to login
  useEffect(() => {
    if (!LoggedUser) {
      navigate("/");
    } else if (LoggedUser.role === "admin") {
      navigate("/AdminDashboard/EnterpriseAi");
    }
    else if(LoggedUser.role === "technician"){
      navigate('/User/StoreDetails');
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
    try {
      await axios.post(baseurl + "/api/placeOrder", { user_id: userId });
      navigate("/User/PaymentSuccess");
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  return (
    <>
      <NavBar />
      <div className="container my-4">
        <h2 className="text-center mb-4">Your Cart: {cartItems.length} items</h2>
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
                        <p className="text-muted mb-0">{item.product.brand_name}</p>
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
                      Rs {(item.product.mrp_rate * item.quantity).toFixed(2)}
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
                    <i className="bi bi-trash cart-remove-item "></i>
                  </button>
                  <select
                    className="form-select "
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.cid, parseInt(e.target.value))
                    }
                  >
                    {[...Array(10).keys()].map((i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
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
              <div className="d-flex justify-content-between">
                <span>Sub total</span>
                <span>{cartItems.length} items</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Total MRP</span>
                <span>Rs {totalAmount.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold">
                <span>Total Cart Value</span>
                <span className="text-primary">
                  Rs {totalAmount.toFixed(2)}
                </span>
              </div>
              <button
                className="btn btn-success w-100 mt-3"
                onClick={handleCheckout}
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
