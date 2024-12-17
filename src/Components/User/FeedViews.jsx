import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "./NavBar";
import UserSearch from "./UserSearch";
import baseurl from "../ApiService/ApiService";
import Compressor from "./Assets/compressor-img.png";
import Swal from "sweetalert2";
import { PencilLine, Trash2 } from "lucide-react";

const FeedViews = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredForums, setFilteredForums] = useState([]);
  const [selectedProductImage, setSelectedProductImage] = useState("");
  const [editingForum, setEditingForum] = useState(null);
  const user = JSON.parse(localStorage.getItem('userData'));
  const [formData, setFormData] = useState({
    quantity: "",
    name: "",
    phone_number: "",
    close_date: ""
  });
  const [forums, setForums] = useState([]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    resetForm();
  };

  const toggleEditModal = () => {
    setIsEditModalOpen(!isEditModalOpen);
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/getAllProducts`);
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchForums = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/forums`);
      const allForums = response.data?.data || [];
    
      // Filter forums by user_id if the user is a technician
      const userForums = allForums.filter(forum => forum.user_id === user.uid);
    
      // Sort forums by updatedAt or createdAt in descending order
      const sortedForums = (user.role === 'technician' ? userForums : allForums).sort(
        (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
    
      // Set sorted forums
      setForums(sortedForums);
    } catch (error) {
      console.error("Error fetching forums:", error);
    }
    
  };

  useEffect(() => {
    fetchForums();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedProduct || !formData.quantity || !formData.name || !formData.phone_number) {
      Swal.fire({
        icon: 'error',
        title: 'Incomplete Form',
        text: 'Please fill in all required fields.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const submissionData = {
      user_id: user.uid,
      product_id: products.find((product) => product.product_name === selectedProduct)?.pid,
      product_name: selectedProduct,
      quantity: formData.quantity,
      name: formData.name,
      phone_number: formData.phone_number,
      close_date: formData.close_date
    };

    try {
      const response = await axios.post(`${baseurl}/api/forum`, submissionData);
      if (response.status === 201 && response.data?.message === "Forum created successfully") {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Requirement submitted successfully!',
          confirmButtonText: 'OK'
        });
        resetForm();
        setIsModalOpen(false)
        fetchForums();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'Submission failed. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error("Submission Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Error',
        text: 'Failed to submit. Please check your network or contact support.',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editingForum || !formData.quantity || !formData.name || !formData.phone_number) {
      Swal.fire({
        icon: 'error',
        title: 'Incomplete Form',
        text: 'Please fill in all required fields.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const updateData = {
      product_name: formData.product_name,
      quantity: formData.quantity,
      name: formData.name,
      phone_number: formData.phone_number,
      close_date: formData.close_date
    };

    try {
      const response = await axios.put(`${baseurl}/api/forum/${editingForum.fid}`, updateData);
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Forum updated successfully!',
          confirmButtonText: 'OK'
        });
        resetForm();
        setIsEditModalOpen(false);
        fetchForums();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'Update failed. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error("Update Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Update Error',
        text: 'Failed to update. Please check your network or contact support.',
        confirmButtonText: 'OK'
      });
    }
  };

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

  const handleEditForum = (forum) => {
    setEditingForum(forum);
    setFormData({
      product_name: forum.product_name,
      quantity: forum.quantity,
      name: forum.name,
      phone_number: forum.phone_number,
      close_date: forum.close_date
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteForum = async (forumId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await axios.delete(`${baseurl}/api/forum/${forumId}`);
        Swal.fire(
          'Deleted!',
          'Your forum has been deleted.',
          'success'
        );
        fetchForums();
      }
    } catch (error) {
      console.error("Delete Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Delete Error',
        text: 'Failed to delete. Please try again.',
        confirmButtonText: 'OK'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      quantity: "",
      name: "",
      phone_number: "",
    });
    setSelectedProduct("");
    setSelectedProductImage("");
    setEditingForum(null);
  };

  const availableProducts = products.filter(product => product.stocks > 0);

  const handleTakeForum = async (forumId) => {
    if (!user || !user.uid) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please log in to take this forum listing',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      const response = await axios.post(`${baseurl}/api/forumtake/${forumId}`, {
        distributor_id: user.uid
      });

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: response.data.message,
        confirmButtonText: 'OK'
      });

      fetchForums();
    } catch (error) {
      if (error.response) {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: error.response.data.message || 'Failed to take forum listing',
          confirmButtonText: 'OK'
        });
      } else if (error.request) {
        Swal.fire({
          icon: 'error',
          title: 'Connection Error',
          text: 'No response received from server',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error processing your request',
          confirmButtonText: 'OK'
        });
      }
      console.error('Forum take error:', error);
    }
  };

  const handleSearch = (searchTerm) => {
    const query = searchTerm.toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setFilteredForums(forums);
      return;
    }

    const filtered = forums.filter((forum) =>
      forum.product_name?.toLowerCase().includes(query) ||
      forum.name?.toLowerCase().includes(query)
    );

    setFilteredForums(filtered);
  };

  return (
    <>
      <NavBar />
      <div className="container py-3 feed_views_main">
        <div className="row w-100 justify-content-evenly align-items-center mt-4">
          <div className="col-10 w-75 feed_views_search">
            <UserSearch onSearch={handleSearch} />
          </div>

          {/* {user.role === 'distributor' ? (
            <div></div>
          ) : ( */}
            <div className="col-12 col-md-2 col-lg-2 text-center text-md-start add-post-btn-div">
              <button
                className="btn d-flex align-items-center justify-content-center rounded-3 w-100 add-post-button"
                onClick={toggleModal}
              >
                <i className="bi bi-box me-2"></i> Add Post
              </button>
            </div>
          {/* )} */}
        </div>
      </div>

      <div className="container mt-4">
        <div className="row justify-content-center">
          {forums.length > 0 ? (
            (searchQuery ? filteredForums : forums).map((forum) => {
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
                      <p className="d-flex justify-content-between">
                        <span className="fw-bold">Close Date: </span>
                        <span> {forum.close_date
                          ? new Date(forum.close_date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                          : 'No Date'}</span>
                      </p>

                      {user && user.role === 'technician' && (
                        <div className="d-flex gap-3 w-100 d-flex justify-content-end">
                          <button
                            className="btn btn-link p-0"
                            onClick={() => handleEditForum(forum)}
                          >
                            <PencilLine size={20} className="text-info" />
                          </button>
                          <button
                            className="btn btn-link p-0"
                            onClick={() => handleDeleteForum(forum.fid)}
                          >
                            <Trash2 size={20} className="text-danger" />
                          </button>
                        </div>
                      )}

                      {user && user.role === 'distributor' && (
                        <div className="w-100 d-flex justify-content-end">
                          {forum.status === 'Taken' ? (
                            <p style={{ color: 'blue', fontWeight: 'bold' }}>Taked</p>
                          ) : (
                            <button
                              className="btn w-25"
                              style={{ background: '#F24E1E', color: 'white' }}
                              onClick={() => handleTakeForum(forum.fid)}
                            >
                              Take
                            </button>
                          )}
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

      {/* Add Forum Modal */}
      {isModalOpen && (
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
              <div className="mb-3">
                <label>Close Date</label>
                <input
                  type="date"
                  name="close_date"
                  className="form-control"
                  placeholder="Enter Close Date"
                  value={formData.close_date}
                  onChange={handleInputChange}
                />
              </div>
              <button type="submit" className="btn requirment-btn">
                Submit Requirement
              </button>
            </form>
          </div>
        </div>
      )}


      {/* Edit Forum Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-button" onClick={toggleEditModal}>
              &times;
            </span>
            <h4 className="sideHeading mt-3 mb-4">
              Edit Your Forum Requirement
            </h4>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-3">
                <label>Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingForum?.product_name || ''}
                  disabled
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
              <div className="mb-3">
                <label>Close Date</label>
                <input
                  type="date"
                  name="close_date"
                  className="form-control"
                  placeholder="Enter Close Date"
                  value={formData.close_date}
                  onChange={handleInputChange}
                />
              </div>
              <button type="submit" className="btn requirment-btn">
                Update Requirement
              </button>
            </form>
          </div>
        </div>
      )}

    </>
  );
};

export default FeedViews;
