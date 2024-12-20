import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from 'react-router-dom';
import UserSearch from "./UserSearch";
import axios from 'axios';
import baseurl from '../ApiService/ApiService';
import Swal from 'sweetalert2';
const Card = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigate = useNavigate();
  const LoggedUser = JSON.parse(localStorage.getItem('userData')) || {};
  
  useEffect(() => {
    if (!LoggedUser) {
      navigate("/Auth/Login");
    }
  }, [LoggedUser, navigate]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${baseurl}/api/getAllProducts`);
        setProducts(response.data || []);
        setFilteredProducts(response.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setFilteredProducts([]);
      }
    };
    fetchProducts();
  }, []);
  const [formData, setFormData] = useState({
    quantity: 1,
    distributor_name: LoggedUser?.username || "",
    phone_number: LoggedUser?.mobile_number || ""
  });

  // Handle input change for form
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Open modal and set selected product
  // const handleAddToCartClick = (product) => {
  //   setSelectedProduct(product);
  //   // setFormData(prevData => ({
  //   //   ...prevData,
  //   //   quantity: 1,
  //   // }));
  //   setIsModalOpen(true);
  // };
  const handleAddToCartClick = async (product) => {
    // setSelectedProduct(product);
    //   setFormData(prevData => ({
    //   ...prevData,
    //   quantity: 1,
    // }));
    // if (!selectedProduct || !formData.quantity || !formData.distributor_name || !formData.distributor_location || !formData.phone_number) {
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Incomplete Form',
    //     text: 'Please fill in all required fields.',
    //     confirmButtonText: 'OK',
    //     confirmButtonColor: '#3085d6'
    //   });
    //   return;
    // }

    try {
      // First, add to cart
      const cartResponse = await axios.post(`${baseurl}/api/addtocart`, {
        user_id: LoggedUser.uid,
        product_id: product.product_id,
        product_name: product.product_name,
        quantity: formData.quantity,
        distributor_name: formData.distributor_name,
        // distributor_location: LoggedUser.location,
        phone_number: formData.phone_number,
      });

      if (cartResponse.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: "Product added to cart successfully!",
          confirmButtonText: 'Go to Cart',
          cancelButtonText: 'Continue Shopping',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/User/Cart');
          } else {
            setIsModalOpen(false);
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: "Submission failed. Please try again.",
          confirmButtonText: 'Retry',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error("Submission Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Failed to submit. Please check your network or contact support.",
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33'
      });
    }
  }
  // Close modal
  // const toggleModal = () => {
  //   setIsModalOpen(!isModalOpen);
  // };

  // Handle form submission
  // const handleSubmit = async (event) => {
  //   event.preventDefault();

  //   if (!selectedProduct || !formData.quantity || !formData.distributor_name || !formData.distributor_location || !formData.phone_number) {
  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'Incomplete Form',
  //       text: 'Please fill in all required fields.',
  //       confirmButtonText: 'OK',
  //       confirmButtonColor: '#3085d6'
  //     });
  //     return;
  //   }

  //   try {
  //     // First, add to cart
  //     const cartResponse = await axios.post(`${baseurl}/api/addtocart`, {
  //       user_id: LoggedUser.uid,
  //       product_id: selectedProduct.product_id,
  //       product_name: selectedProduct.product_name,
  //       quantity:  Number(formData.quantity),
  //       distributor_name: formData.distributor_name,
  //       distributor_location: formData.distributor_location,
  //       phone_number: formData.phone_number,
  //     });

  //     if (cartResponse.status === 201) {
  //       Swal.fire({
  //         icon: 'success',
  //         title: 'Success',
  //         text: "Product added to cart successfully!",
  //         confirmButtonText: 'Go to Cart',
  //         cancelButtonText: 'Continue Shopping',
  //         showCancelButton: true,
  //         confirmButtonColor: '#3085d6',
  //         cancelButtonColor: '#d33'
  //       }).then((result) => {
  //         if (result.isConfirmed) {
  //           navigate('/User/Cart');
  //         } else {
  //           setIsModalOpen(false);
  //         }
  //       });
  //     } else {
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Oops...',
  //         text: "Submission failed. Please try again.",
  //         confirmButtonText: 'Retry',
  //         confirmButtonColor: '#d33'
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Submission Error:", error);
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Error',
  //       text: "Failed to submit. Please check your network or contact support.",
  //       confirmButtonText: 'OK',
  //       confirmButtonColor: '#d33'
  //     });
  //   }
  // };
  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((product) => {
      if (LoggedUser?.role === 'technician') {
        return product.companyname?.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (LoggedUser?.role === 'distributor') {
        return product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) || product.brand_name?.toLowerCase().includes(searchTerm.toLowerCase());;
      }
      return true;
    });

    setFilteredProducts(filtered);
  };
  // const handleLocationSearch = (location) => {

  // };
  // const handleNearDistricts = (districts) => {

  // };
  const handleDistributorProductView = (product) => {
    navigate(`/User/DistributorProductView/${product.pid}`);
  }

  return (
    <>
    <div className="container py-3 feed_views_main">
        <div className="row w-100 justify-content-evenly align-items-center mt-4">
          <div className="col-10 w-75 feed_views_search">
            <UserSearch onSearch={handleSearch} />
          </div>

          {LoggedUser.role === 'technicion' ? (
            <div></div>
          ) : (
            <div className="col-12 col-md-2 col-lg-2 text-center text-md-start add-post-btn-div">
              <button
                className="btn d-flex align-items-center justify-content-center rounded-3 w-100 add-forum-button"
                onClick={() => navigate("/user/FeedViews")}
                style={{
                  backgroundColor: "#0000ff",
                  color:'white',
                  height: "40px",
                  fontSize: "20px",
                  borderRadius: "10px",
                }}
              >
                <i className="bi bi-box me-2"></i> Forum
              </button>
            </div>
          )}
        </div>
      </div>
      {/* <UserSearch onSearch={handleSearch} />
      <div className="mt-3 forum-div d-flex align-items-center justify-content-center">
          <button
            className="btn text-white px-4 d-flex align-items-center justify-content-center forum-button"
            style={{
              backgroundColor: "#0000ff",
              height: "40px",
              fontSize: "20px",
              borderRadius: "10px",
            }}
            onClick={() => navigate("/user/FeedViews")}
          >
            <i className="bi bi-box-seam me-2"></i> Post
          </button>
        </div> */}
      {/* <SearchBarLoction onLocationSearch={handleLocationSearch} onSearchNear={handleNearDistricts}/> */}
      <div className="container mt-5 mb-3">
        <div className="row g-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.pid} className="col-6 col-sm-6 col-md-4 col-lg-3">
                <div className="card product-card h-100">
                  <div className='card-img d-flex align-items-center justify-content-center' style={{ height: '200px' }}>
                    <img
                      src={`${baseurl}/${product.images[0]?.image_path || 'default.jpg'}`}
                      className="card-img-top rounded-3 p-3 mw-100 mh-100"
                      alt={product.product_name}
                      style={{ objectFit: 'contain' }}
                      onClick={() => handleDistributorProductView (product)}
                    />
                  </div>

                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title" onClick={() => handleDistributorProductView (product)}>{product.product_name}</h5>
                    <span></span>
                    <h5 className="card-text mt-3"><i class="bi bi-currency-rupee"></i> {product.mrp_rate}</h5>
                    <div className='d-block d-lg-flex align-items-center justify-content-between mb-3'><small className="">{product.brand_name}</small>
                      {/* <p className={product.stocks === 0 ? 'text-danger' : ''}>
                      Stocks : {product.stocks === 0 ? 'Out of stock' : product.stocks}
                    </p> */}
                    </div>
                    <div className="text-center mt-auto">
                      <a
                        href="#"
                        className="btn w-100 add-to-card-button"
                        onClick={() => handleAddToCartClick(product)}
                      >
                        Add to cart
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No products available</p>
          )}
        </div>

        {/* {isModalOpen && selectedProduct && (
          <div className="modal-overlay">
            <div className="modal-content">
              <span className="close-button" onClick={toggleModal}>
                &times;
              </span>
              <h4 className="sideHeading mt-3 mb-4">
                Tell us what you need, and we'll help you get quotes
              </h4>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label>Product Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedProduct.product_name}
                    readOnly
                  />
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
                    min="1"
                  />
                </div>
                <div className="mb-3">
                  <label>Distributor Name</label>
                  <input
                    type="text"
                    name="distributor_name"
                    className="form-control"
                    placeholder="Enter Your Name"
                    value={formData.distributor_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label>Distributor Location</label>
                  <input
                    type="text"
                    name="distributor_location"
                    className="form-control"
                    placeholder="Enter Your Location"
                    value={formData.distributor_location}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label>Distributor Phone Number</label>
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
        )} */}
      </div>
    </>
  );
};

export default Card;