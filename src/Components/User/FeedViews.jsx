import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "./NavBar";
import UserSearch from "./UserSearch";
import baseurl from "../ApiService/ApiService";
import Compressor from "./Assets/compressor-img.png";
import Swal from "sweetalert2";
import { PencilLine, Trash2, X, Plus } from "lucide-react";

const EditForumModal = ({
  isOpen,
  onClose,
  formData,
  editingForum,
  selectedProducts,
  availableProducts,
  handleProductChange,
  handleAddProduct,
  handleRemoveProduct,
  handleInputChange,
  handleSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div className="modal-content" style={{
        backgroundColor: "white",
        borderRadius: "8px",
        width: "90%",
        maxWidth: "600px",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}>
        <div style={{
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          padding: "15px",
          borderBottom: "1px solid #dee2e6",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
          zIndex: 1,
        }}>
          <span
            className="close-button"
            onClick={onClose}
            style={{
              position: "absolute",
              right: "15px",
              top: "15px",
              cursor: "pointer",
              fontSize: "24px",
            }}
          >
            &times;
          </span>
          <h4 className="sideHeading mb-0">Edit Your Forum Requirement</h4>
        </div>

        <div style={{
          overflowY: "auto",
          padding: "15px",
          flex: 1,
        }}>
          <form onSubmit={handleSubmit}>
            {selectedProducts.map((item, index) => (
              <div key={index} className="mb-3 border p-3 rounded position-relative">
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <label>Product Name</label>
                    <select
                      className="form-select"
                      value={item.product}
                      onChange={(e) => handleProductChange(index, "product", e.target.value)}
                    >
                      <option value="" disabled>Select Product Name</option>
                      {availableProducts.map((product) => (
                        <option key={product.pid} value={product.product_name}>
                          {product.product_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4 mb-2">
                    <label>Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter Quantity"
                      value={item.quantity}
                      onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                    />
                  </div>
                  <div className="col-md-2 d-flex align-items-end mb-2">
                    {index > 0 && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleRemoveProduct(index)}
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="mb-3">
              <button
                type="button"
                className="btn btn-secondary w-100"
                onClick={handleAddProduct}
              >
                <Plus size={20} className="me-2" />
                Add Another Product
              </button>
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
                value={formData.close_date}
                onChange={handleInputChange}
              />
            </div>

            <div style={{
              position: "sticky",
              bottom: 0,
              backgroundColor: "white",
              padding: "15px 0",
              borderTop: "1px solid #dee2e6",
              marginLeft: "-15px",
              marginRight: "-15px",
              marginBottom: "-15px",
              textAlign: "center",
            }}>
              <button type="submit" className="btn requirment-btn">
                Update Requirements
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const FeedViews = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredForums, setFilteredForums] = useState([]);
  const [selectedProductImage, setSelectedProductImage] = useState("");
  const [editingForum, setEditingForum] = useState(null);
  const user = JSON.parse(localStorage.getItem("userData"));
  const [selectedProducts, setSelectedProducts] = useState([
    { product: "", quantity: "" },
  ]);
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    close_date: "",
  });
  const [forums, setForums] = useState([]);

  const [activeTab, setActiveTab] = useState('all');
  
  const filterForums = (forums, filterType) => {
    const user = JSON.parse(localStorage.getItem("userData"));
    
    switch (filterType) {
      case 'technician':
        return forums.filter(forum => 
          forum.user_id && forum.user.role === 'technician'
        );
      case 'distributor':
        return forums.filter(forum => 
          forum.user.uid !== user?.uid && forum.user.role === 'distributor'
        );
      case 'my':
        return forums.filter(forum => 
          forum.user.uid === user?.uid
        );
      default:
        return forums;
    }
  };

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
      // Ensure we have an array to work with
      const allForums = Array.isArray(response.data.data) ? response.data.data : [];

      // Filter forums by user_id if the user is a technician
      const userForums = user?.role === "technician"
        ? allForums.filter(forum => forum.user_id === user.uid)
        : allForums;

      // Make sure we're sorting an array
      if (Array.isArray(userForums)) {
        const sortedForums = userForums.sort((a, b) =>
          new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );
        setForums(sortedForums);
        setFilteredForums(sortedForums);
      } else {
        console.error("Forums data is not an array:", userForums);
        setForums([]);
        setFilteredForums([]);
      }
    } catch (error) {
      console.error("Error fetching forums:", {
        message: error.message,
        data: error.response?.data,
        status: error.response?.status,
        userRole: user?.role,
        userId: user?.uid
      });

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load forums. Please try again later.",
        confirmButtonText: "OK",
      });
    }
  };

  useEffect(() => {
    fetchForums();
  }, []);


  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Add this function to handle editing initialization
  const handleEditForum = (forum) => {
    // Format the data for editing
    const formattedProducts = forum.forumProducts.map(product => ({
      product: product.product_name,
      quantity: product.quantity,
      fpid: product.fpid
    }));

    setFormData({
      name: forum.name,
      phone_number: forum.phone_number,
      close_date: new Date(forum.close_date).toISOString().split('T')[0]
    });

    setSelectedProducts(formattedProducts);
    setEditingForum(forum);
    setIsEditModalOpen(true);
  };

  // Updated function to handle edit form submission
  // Frontend changes in handleEditSubmit function
  const handleEditSubmit = async (event) => {
    event.preventDefault();

    // Ensure we have a valid forum ID
    if (!editingForum?.fid) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Invalid forum ID",
        confirmButtonText: "OK",
      });
      return;
    }

    // Validate form data
    if (!formData.name || !formData.phone_number || !formData.close_date) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill in all required fields",
        confirmButtonText: "OK",
      });
      return;
    }

    // Validate phone number
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(formData.phone_number)) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Phone number must be between 10 and 15 digits",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      // Format the data according to backend expectations
      const submissionData = {
        name: formData.name,
        phone_number: formData.phone_number,
        close_date: formData.close_date,
        forumProducts: selectedProducts.map(item => {
          const productData = {
            product_name: item.product,
            quantity: parseInt(item.quantity),
            fpid: item.fpid
          };

          // Add product_id if available
          const matchingProduct = products.find(p => p.product_name === item.product);
          if (matchingProduct) {
            productData.product_id = matchingProduct.pid;
          }

          return productData;
        })
      };

      // Validate products data
      const invalidProducts = submissionData.forumProducts.filter(
        product => !product.product_name || !product.quantity || product.quantity < 1
      );

      if (invalidProducts.length > 0) {
        throw new Error('All products must have a name and positive quantity');
      }

      const response = await axios.put(
        `${baseurl}/api/forum/${editingForum.fid}`,
        submissionData
      );

      if (response.status === 200) {
        await fetchForums();

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Forum updated successfully!",
          confirmButtonText: "OK",
        });

        setIsEditModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Update Error:", error);
      const errorMessage = error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        "Failed to update forum. Please try again.";

      Swal.fire({
        icon: "error",
        title: "Update Error",
        text: errorMessage,
        confirmButtonText: "OK",
      });
    }
  };


  const handleDeleteForum = async (forumId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await axios.delete(`${baseurl}/api/forum/${forumId}`);
        Swal.fire("Deleted!", "Your forum has been deleted.", "success");
        fetchForums();
      }
    } catch (error) {
      console.error("Delete Error:", error);
      Swal.fire({
        icon: "error",
        title: "Delete Error",
        text: "Failed to delete. Please try again.",
        confirmButtonText: "OK",
      });
    }
  };

  // Add handler for adding new product row
  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, { product: "", quantity: "" }]);
  };

  // Add handler for removing product row
  const handleRemoveProduct = (index) => {
    if (selectedProducts.length > 1) {
      const updatedProducts = selectedProducts.filter((_, i) => i !== index);
      setSelectedProducts(updatedProducts);
    }
  };

  // Add handler for product and quantity changes
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index][field] = value;
    setSelectedProducts(updatedProducts);
  };

  // Modify handleSubmit to handle multiple products
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Filter out empty rows and validate products
    const validProducts = selectedProducts.filter(
      (item) => item.product && item.quantity && item.quantity > 0
    );

    if (
      validProducts.length === 0 ||
      !formData.name ||
      !formData.phone_number ||
      !formData.close_date
    ) {
      Swal.fire({
        icon: "error",
        title: "Incomplete Form",
        text: "Please fill in all required fields.",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const submissionData = {
        user_id: user.uid,
        name: formData.name,
        phone_number: formData.phone_number,
        close_date: formData.close_date,
        products: validProducts.map((item) => ({
          product_id: products.find(p => p.product_name === item.product)?.pid,
          product_name: item.product,
          quantity: parseInt(item.quantity),
        })),
      };

      const response = await axios.post(`${baseurl}/api/forum`, submissionData);

      if (response.status === 201 || response.status === 200) {
        await fetchForums();

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Requirements submitted successfully!",
          confirmButtonText: "OK",
        });

        resetForm();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      Swal.fire({
        icon: "error",
        title: "Submission Error",
        text: error.response?.data?.message ||
          "Failed to submit. Please check your network or contact support.",
        confirmButtonText: "OK",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone_number: "",
      close_date: "",
    });
    setSelectedProducts([{ product: "", quantity: "" }]);
    setSelectedProductImage("");
    setEditingForum(null);
  };

  const availableProducts = products.filter((product) => product.stocks > 0);

  const handleTakeForum = async (forumId) => {
    if (!user || !user.uid) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please log in to take this forum listing",
        confirmButtonText: "OK",
      });
      return;
    }
  
    // Show loading state
    const loadingSwal = Swal.fire({
      title: 'Processing...',
      text: 'Please wait while we process your request',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });
  
    try {
      const response = await axios.post(`${baseurl}/api/forumtake/${forumId}`, {
        distributor_id: user.uid,
        status: 'Taken'
      });
  
      await loadingSwal.close();
  
      if (response.data && response.status === 200) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Forum taken successfully!",
          confirmButtonText: "OK",
        });
  
        // Refresh forums list
        await fetchForums();
      }
    } catch (error) {
      await loadingSwal.close();
  
      let errorMessage = "Error processing your request";
  
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
  
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonText: "OK",
      });
      console.error("Forum take error:", error);
    }
  };


  const handleSearch = (searchTerm) => {
    const query = searchTerm.toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setFilteredForums(forums);
      return;
    }

    const filtered = forums.filter(
      (forum) =>
        forum.product_name?.toLowerCase().includes(query) ||
        forum.name?.toLowerCase().includes(query)
    );

    setFilteredForums(filtered);
  };

  const renderAddForumModal = () =>
    isModalOpen && (
      <div
        className="modal-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          className="modal-content"
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            width: "90%",
            maxWidth: "600px",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Fixed Header */}
          <div
            style={{
              position: "sticky",
              top: 0,
              backgroundColor: "white",
              padding: "15px",
              borderBottom: "1px solid #dee2e6",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
              zIndex: 1,
            }}
          >
            <span
              className="close-button"
              onClick={toggleModal}
              style={{
                position: "absolute",
                right: "15px",
                top: "15px",
                cursor: "pointer",
                fontSize: "24px",
              }}
            >
              &times;
            </span>
            <h4 className="sideHeading mb-0">
              Tell us what you need, and we'll help you get quotes
            </h4>
          </div>

          {/* Scrollable Content */}
          <div
            style={{
              overflowY: "auto",
              padding: "15px",
              flex: 1,
            }}
          >
            <form onSubmit={handleSubmit}>
              {selectedProducts.map((item, index) => (
                <div
                  key={index}
                  className="mb-3 border p-3 rounded position-relative"
                >
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label>Product Name</label>
                      <select
                        className="form-select"
                        value={item.product}
                        onChange={(e) =>
                          handleProductChange(index, "product", e.target.value)
                        }
                      >
                        <option value="" disabled>
                          Select Product Name
                        </option>
                        {availableProducts.map((product) => (
                          <option
                            key={product.pid}
                            value={product.product_name}
                          >
                            {product.product_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4 mb-2">
                      <label>Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Enter Quantity"
                        value={item.quantity}
                        onChange={(e) =>
                          handleProductChange(index, "quantity", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-md-2 d-flex align-items-end mb-2">
                      {index > 0 && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleRemoveProduct(index)}
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="mb-3">
                <button
                  type="button"
                  className="btn btn-secondary w-100"
                  onClick={handleAddProduct}
                >
                  <Plus size={20} className="me-2" />
                  Add Another Product
                </button>
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
                  value={formData.close_date}
                  onChange={handleInputChange}
                />
              </div>

              {/* Fixed Submit Button */}
              <div
                style={{
                  position: "sticky",
                  bottom: 0,
                  backgroundColor: "white",
                  padding: "15px 0",
                  borderTop: "1px solid #dee2e6",
                  marginLeft: "-15px",
                  marginRight: "-15px",
                  marginBottom: "-15px",
                  textAlign: "center",
                }}
              >
                <button type="submit" className="btn requirment-btn">
                  Submit Requirements
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );

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

      {user?.role === "distributor" && ( 
      <div className="mt-4 d-flex justify-content-center w-100">
          <ul className="nav ">
            {/* <li className="nav-item">
              <button 
                className={`nav-link forum-menu ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Forums
              </button>
            </li> */}
            <li className="nav-item">
              <button 
                className={`nav-link  forum-menu ${activeTab === 'technician' ? 'active' : ''}`}
                onClick={() => setActiveTab('technician')}
              >
                Technician
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link forum-menu ${activeTab === 'distributor' ? 'active' : ''}`}
                onClick={() => setActiveTab('distributor')}
              >
                Distributor
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link forum-menu ${activeTab === 'my' ? 'active' : ''}`}
                onClick={() => setActiveTab('my')}
              >
                My Forums
              </button>
            </li>
          </ul>
        </div>
        )}
    
      <div className="container mt-4">
        <div className="row justify-content-center">
          {forums.length > 0 ? (
            filterForums(searchQuery ? filteredForums : forums, activeTab).map((forum) => (
              <div className="col-12 col-md-10" key={forum.id || forum._id}>
                <div className="card shadow-sm p-3 mb-5">
                  <div className="d-flex flex-column flex-md-row align-items-center align-items-md-center">
                    <div className="w-25 me-md-4">
                      <img
                        src={forum.image_url || Compressor}
                        alt="Product"
                        className="img-fluid rounded"
                        style={{ width: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div className="w-100 w-md-75">
                      <div className="d-flex justify-content-between mb-3">
                        <div>
                          <span className="fw-bold">Post by: </span>
                          <span>{forum.name || "Unknown"}</span>
                        </div>
                        <div>
                          <span className="fw-bold">Close Date: </span>
                          <span>
                            {forum.close_date
                              ? new Date(forum.close_date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                              : "No Date"}
                          </span>
                        </div>
                      </div>

                      <div className="table-responsive">
                        <table className="table table-bordered mb-0">
                          <thead className="table-light">
                            <tr>
                              <th scope="col" className="text-center">Product Name</th>
                              <th scope="col" className="text-center">Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {forum.forumProducts.map((forumProduct, index) => {
                              return (
                                <tr key={index}>
                                  <td className="text-center">{forumProduct.product_name || "N/A"}</td>
                                  <td className="text-center">{forumProduct.quantity || "N/A"}</td>
                                </tr>
                              )
                            })
                            }
                          </tbody>
                        </table>
                      </div>

                      <div className="d-flex justify-content-end mt-3">
                        {user?.role === "technician" && (
                          <div className="d-flex gap-3">
                            <button
                              className="btn btn-link p-0"
                              onClick={() => handleEditForum(forum)}
                            >
                              <PencilLine size={20} className="text-info" />
                            </button>
                            <button
                              className="btn btn-link p-0"
                              onClick={() => handleDeleteForum(forum.id || forum._id)}
                            >
                              <Trash2 size={20} className="text-danger" />
                            </button>
                          </div>
                        )}
                        {user?.role === "distributor" && activeTab !== "my" && (
                          <div>
                            {forum.status === "Taken" ? (
                              <p className="mb-0" style={{ color: "blue", fontWeight: "bold" }}>
                                Taken
                              </p>
                            ) : (
                              <button
                                className="btn"
                                style={{
                                  background: "#F24E1E",
                                  color: "white",
                                  width: "120px",
                                }}
                                onClick={() => handleTakeForum(forum.fid)} // Use forum.fid instead of forum.id || forum._id
                              >
                                Take
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No forums available.</p>
          )}
        </div>
      </div>
      {renderAddForumModal()}

      {isEditModalOpen && (
        <EditForumModal
          isOpen={isEditModalOpen}
          onClose={toggleEditModal}
          formData={formData}
          selectedProducts={selectedProducts}
          availableProducts={availableProducts}
          handleProductChange={handleProductChange}
          handleAddProduct={handleAddProduct}
          handleRemoveProduct={handleRemoveProduct}
          handleInputChange={handleInputChange}
          handleSubmit={handleEditSubmit}
        />
      )}
    </>
  );
};

export default FeedViews;
