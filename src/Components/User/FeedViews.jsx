import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "./NavBar";
import baseurl from "../ApiService/ApiService";
import Compressor from "./Assets/compressor-img.png";

const FeedViews = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedProductImage, setSelectedProductImage] = useState("");
  const user = JSON.parse(localStorage.getItem('userData'));
  const [formData, setFormData] = useState({
    quantity: "",
    name: "",
    phone_number: "",
  });
  const [forums, setForums] = useState([]);

  // Toggle modal visibility
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/getAllProducts`);
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]); // Fallback to empty array in case of error
    }
  };

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);
  const fetchForums = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/forums`);
      setForums(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching forums:", error);
    }
  };
  // Fetch forums
  useEffect(() => {
    fetchForums();
  }, []);
  

  // Handle input change
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedProduct || !formData.quantity || !formData.name || !formData.phone_number) {
      alert("Please fill in all required fields.");
      return;
    }

    const submissionData = {
      user_id: user.uid,
      product_id: products.find((product) => product.product_name === selectedProduct)?.pid,
      product_name: selectedProduct,
      quantity: formData.quantity,
      name: formData.name,
      phone_number: formData.phone_number,
    };

    try {
      const response = await axios.post(`${baseurl}/api/forum`, submissionData);
      if (response.status === 201 && response.data?.message === "Forum created successfully") {
        alert("Requirement submitted successfully!");
        setFormData({
          quantity: "",
          name: "",
          phone_number: "",
        });
        fetchProducts();
        fetchForums();
        setSelectedProduct("");
        setSelectedProductImage("");
        setIsModalOpen(false);
      } else {
        alert("Submission failed. Please try again.");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Failed to submit. Please check your network or contact support.");
    }
  };

  // Handle product selection
  const handleProductChange = (event) => {
    const selectedProductName = event.target.value;
    setSelectedProduct(selectedProductName);
    const selectedProduct = products.find(
      (product) => product.product_name === selectedProductName
    );
    if (selectedProduct) {
      setSelectedProductImage(selectedProduct.image_path);
    }
  };
  const availableProducts = products.filter(product => product.stocks > 0);
  const handleTakeForum = async (forumId) => {
    // Check if user and user.uid exist
    if (!user || !user.uid) {
      alert('Please log in to take this forum listing');
      return;
    }
  
    try {
      const response = await axios.post(`${baseurl}/api/forumtake/${forumId}`, {
        distributor_id: user.uid
      });
      alert(response.data.message);
      
      fetchForums();
    } catch (error) {
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        alert(error.response.data.message || 'Failed to take forum listing');
      } else if (error.request) {
        // The request was made but no response was received
        alert('No response received from server');
      } else {
        // Something happened in setting up the request
        alert('Error processing your request');
      }
      console.error('Forum take error:', error);
    }
  };

  return (
    <>
      <NavBar />
      <div className="container py-3">
        <div className="row justify-content-center align-items-center mt-4">
          <div className="col-12 col-md-8 col-lg-6 mb-3 mb-md-0">
            <div className="feedviews-search-bar d-flex align-items-center border rounded-4 px-3">
              <input
                type="text"
                className="form-control border-0 shadow-none px-3"
                placeholder="Search"
              />
              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-x-lg"></i>
                <div className="vr"></div>
                <i className="bi bi-mic-fill"></i>
                <i className="bi bi-search"></i>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4 col-lg-2 text-center text-md-start">
            <button
              className="btn btn-primary d-flex align-items-center justify-content-center rounded-3 w-100 add-post-button"
              onClick={toggleModal}
            >
              <i className="bi bi-box me-2"></i> Add Post
            </button>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row justify-content-center">
          {forums.length > 0 ? (
            forums.map((forum) => {
              const matchingProduct = products.find(
                (product) => product.product_name === forum.product_name
              );

              return (
                <div className="col-12 col-md-10" key={forum.fid}>
                  <div className="card shadow-sm p-3 d-flex flex-column flex-md-row align-items-center mb-5">
                    <img
                      src={
                        matchingProduct?.images?.[0]?.image_path
                          ? `${baseurl}/${matchingProduct.images[0].image_path}`
                          : Compressor
                      }
                      alt={matchingProduct?.product_name || "Product"}
                      className="img-fluid rounded"
                      style={{ width: "30%", objectFit: "cover" }}
                    />
                     <div className="card-body w-100 justify-content-around">
                      <p className="d-flex justify-content-between">
                        <span className="fw-bold text-left">Product Name: </span>
                        <span className="text-left">{matchingProduct?.product_name || "N/A"}</span>
                      </p>
                      <p className="d-flex justify-content-between">
                        <span className="fw-bold text-left">Needed Quality: </span>
                        <span className="text-left">{forum.quantity || "N/A"}</span>
                      </p>
                      <p className="d-flex justify-content-between">
                        <span className="fw-bold">Post by: </span>
                        <span>{forum.name || "Unknown"}</span>
                      </p>
                      {/* <p className="d-flex justify-content-between">
                        <span className="fw-bold">Distributor Location: </span>
                        <span>{forum.location || "Not Provided"}</span>
                      </p> */}
                      <p className="d-flex justify-content-between">
                        <span className="fw-bold">Close Date: </span>
                        <span>{forum.close_date || "No Date"}</span>
                      </p>
                        
                      {user && user.role === 'distributor' && (
                  <div className="w-100 d-flex justify-content-end">
                    <button 
                      className="btn w-25" 
                      style={{background: '#F24E1E', color: 'white'}}
                      onClick={() => handleTakeForum(forum.fid)}
                    >
                      Take
                    </button>
                  </div>
                )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No forums available.</p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-button" onClick={toggleModal}>
              &times;
            </span>
            <h4 className="sideHeading mb-4">
              Tell us what you need, and we'll help you get quotes
            </h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Product Name</label>
                <select
                  className="form-select"
                  value={selectedProduct}
                  onChange={handleProductChange}
                >
                  <option value="" disabled>
                    Select Product Name
                  </option>
                  {availableProducts.map((product) => (
                    <option key={product.pid} value={product.product_name}>
                      {product.product_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  className="form-control"
                  placeholder="Enter Quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  className="form-control"
                  placeholder="Enter Your Phone Number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Submit Requirement
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedViews;
