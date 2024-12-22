import React, { useState, useEffect } from "react";
import axios from "axios";
import baseurl from "../ApiService/ApiService";
import Swal from "sweetalert2";
import Compressor from "../User/Assets/compressor-img.png";

const Forum = () => {
  const [forums, setForums] = useState([]);
  const [products, setProducts] = useState([]);
  const user = JSON.parse(localStorage.getItem("userData"));
  const [selectedTake, setSelectedTake] = useState(null);
  const [isForumModalOpen, setIsForumModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("technician");

  // Fetch all forums
  const fetchAllForums = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/forums`);
      const allForums = response.data?.data || [];
      const latestForums = allForums.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      );
      setForums(latestForums);
      console.log("Fetched Forums:", latestForums);
    } catch (error) {
      console.error("Error fetching forums:", error);
      setForums([]);
    }
  };

  // Fetch all products
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
    fetchAllForums();
    fetchProducts();
  }, []);

  const handleTakeForum = async (forumId) => {
    if (!user || !user.uid) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please log in to take this forum listing",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (user.role !== "distributor") {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "Only distributors can take forum listings",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
      });
      return;
    }

    try {
      const response = await axios.post(`${baseurl}/api/forumtake/${forumId}`, {
        distributor_id: user.uid,
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.data.message,
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      });

      fetchAllForums();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data.message || "Failed to take forum listing",
        confirmButtonText: "Close",
        confirmButtonColor: "#d33",
      });
      console.error("Forum take error:", error);
    }
  };

  const handleOpenModal = async (take) => {
    try {
      const response = await axios.get(
        `${baseurl}/api/forumtakebyid/${take.fid}`
      );
      setSelectedTake(response.data.data[0]);
      setError(null);
    } catch (err) {
      setError("Failed to fetch forum takes");
      console.error("Error fetching forum takes:", err);
    }
    setIsForumModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTake(null);
    setIsForumModalOpen(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const getFilteredForums = () => {
    console.log("Active Tab:", activeTab);
    console.log("All Forums:", forums);
    const filtered =
      activeTab === "technician"
        ? forums.filter((forum) => forum.user.role === "technician")
        : forums.filter((forum) => forum.user.role === "distributor");
    console.log("Filtered Forums:", filtered);
    return filtered;
  };

  const filteredForums = getFilteredForums();
  console.log("Forums to Render:", filteredForums);

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === "technician" ? "active" : ""}`}
            onClick={() => handleTabChange("technician")}
            style={{ cursor: "pointer" }}
          >
            Technician Forum
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${
              activeTab === "distributor" ? "active" : ""
            }`}
            onClick={() => handleTabChange("distributor")}
            style={{ cursor: "pointer" }}
          >
            Distributor Forum
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
              <div key={forum.fid} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3">
                      <img
                        src={
                          matchingProduct?.images?.[0]?.image_path
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
                      <div style={{ marginBottom: "20px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <div className="mb-2">
                            <div>Post by: {forum.name || "Unknown"}</div>
                            <div>
                              Close Date:{" "}
                              {forum.close_date
                                ? new Date(
                                    forum.close_date
                                  ).toLocaleDateString()
                                : "No Date"}
                            </div>
                          </div>
                        </div>
                        <table className="table table-bordered mt-3">
                          <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {forum.forumProducts.map((forumProduct, index) => (
                              <tr key={index}>
                                <td>{forumProduct.product_name || "N/A"}</td>
                                <td>{forumProduct.quantity || "N/A"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div
                        style={{ display: "flex", justifyContent: "flex-end" }}
                      >
                          <button
                            className="btn"
                            style={{
                              backgroundColor: "blue",
                              color: "white",
                              border: "none",
                            }}
                            onClick={() => 
                              forum.status === "Taken" ? handleOpenModal(forum) : ''}
                          >
                            {forum.status === "Taken"
                              ? "View Details"
                              : "Not Taken Forum"}
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

      {/* Modal */}
      {isForumModalOpen && (
        <div
          className={`modal fade ${isForumModalOpen ? "show" : ""}`}
          style={{
            display: isForumModalOpen ? "block" : "none",
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1050,
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
                <h5 className="modal-title">Forum Details</h5>
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
                  <div className="col-6">
                    {new Date(selectedTake.takenAt).toLocaleString()}
                  </div>
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
