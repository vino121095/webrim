import React, { useState, useEffect } from "react";
import axios from "axios";
import baseurl from "../ApiService/ApiService";
import Swal from "sweetalert2";
import { Modal } from "react-bootstrap";
import Compressor from "../User/Assets/compressor-img.png";

const Forum = () => {
  const [forums, setForums] = useState([]);
  const [products, setProducts] = useState([]);
  const user = JSON.parse(localStorage.getItem("userData"));
  const [selectedTake, setSelectedTake] = useState(null);
  const [isForumModalOpen, setIsForumModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("taken"); // Default to 'taken' tab

  // Fetch all forums (including those not taken)
  const fetchAllForums = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/forums`);
      const allForums = response.data?.data || [];
      const latestForums = allForums.sort(
        (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
      setForums(latestForums);
    } catch (error) {
      console.error("Error fetching forums:", error);
      setForums([]);
    }
  };

  // Fetch all products to match with forum listings
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/getAllProducts`);
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  // Handle taking a forum listing
  const handleTakeForum = async (forumId) => {
    if (!user || !user.uid) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please log in to take this forum listing',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    try {
      const response = await axios.post(`${baseurl}/api/forumtake/${forumId}`, {
        distributor_id: user.uid,
      });

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: response.data.message,
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6'
      });

      fetchAllForums(); // Refresh the forums list
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data.message || "Failed to take forum listing",
        confirmButtonText: 'Close',
        confirmButtonColor: '#d33'
      });
      console.error("Forum take error:", error);
    }
  };

  // Fetch forums and products on component mount
  useEffect(() => {
    fetchAllForums();
    fetchProducts();
  }, []);

  const handleOpenModal = async (take) => {
    try {
      const response = await axios.get(`${baseurl}/api/forumtakebyid/${take.fid}`);
      setSelectedTake(response.data.data[0]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch forum takes');
      console.error('Error fetching forum takes:', err);
    }
    setIsForumModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedTake(null);
    setIsForumModalOpen(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const filteredForums = forums.filter(forum => 
    activeTab === "taken" ? forum.status.toLowerCase() === 'taken' : 
    activeTab === "nottaken" ? forum.status.toLowerCase() === 'not taken' : 
    true
  );

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === "taken" ? "active" : ""}`}
            onClick={() => handleTabChange("taken")}
          >
            Taken
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === "nottaken" ? "active" : ""}`}
            onClick={() => handleTabChange("nottaken")}
          >
            Not Taken
          </a>
        </li>
      </ul>

      <div className="row mb-4">
        {filteredForums.length > 0 ? (
          filteredForums.map((forum) => {
            const matchingProduct = products.find(
              (product) => product.product_name === forum.product_name
            );

            return (
              <div key={forum.fid} className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <img
                          src={matchingProduct?.images?.[0]?.image_path
                            ? `${baseurl}/${matchingProduct.images[0].image_path}`
                            : Compressor
                          }
                          alt={matchingProduct?.product_name || "Product"}
                          className="img-fluid rounded"
                          style={{
                            width: "100%",
                            marginTop: "40px",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <div className="col-md-9">
                        <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong>Product Name : </strong>
                          <span>{matchingProduct?.product_name || "N/A"}</span>
                        </div>
                        <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong>Needed Quantity : </strong> {forum.quantity || "N/A"}
                        </div>
                        <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong>Post by : </strong> {forum.name || "Unknown"}
                        </div>
                        <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong>Close Date : </strong> {forum.close_date ? new Date(forum.close_date).toLocaleDateString() : "No Date"}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            className="btn"
                            style={{
                              backgroundColor: forum.status === 'Taken' ? 'blue' : 'orangered',
                              color: "white",
                              border: "none",
                            }}
                            onClick={() => handleOpenModal(forum)}
                            disabled={forum.status === 'Not Taken'} 
                          >
                            {forum.status}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center">No forums available.</p>
        )}
      </div>

      {/* Modal outside of forum mapping */}
      {isForumModalOpen && (
        <div
          className={`modal fade ${isForumModalOpen ? 'show' : ''}`}
          style={{ 
            display: isForumModalOpen ? 'block' : 'none', 
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1050
          }}
          onClick={handleCloseModal}
          tabIndex="-1"
        >
          <div
            className="modal-dialog modal-dialog-centered modal-md" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Forum Take Details</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseModal} 
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Distributor Name:</div>
                  <div className="col-6">{selectedTake.distributorName}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Distributor Email:</div>
                  <div className="col-6">{selectedTake.distributorEmail}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Distributor Phone:</div>
                  <div className="col-6">{selectedTake.distributorPhone}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Distributor Address:</div>
                  <div className="col-6">{selectedTake.distributorAddress}</div>
                </div>
                <div className="row">
                  <div className="col-6 fw-bold">Taken At:</div>
                  <div className="col-6">{new Date(selectedTake.takenAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>  
      )}
    </div>
  );
};

export default Forum;
