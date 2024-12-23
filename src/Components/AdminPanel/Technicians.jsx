import React, { useState, useEffect } from "react";
import { Pagination } from "react-bootstrap";
import { User, Plus, Eye, PencilLine, Trash2, Save, X } from "lucide-react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import axios from "axios";
import baseurl from "../ApiService/ApiService";
import "./AdminPanel.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Swal from "sweetalert2";

const Technicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewTechnician, setViewTechnician] = useState(null);
  const [editTechnician, setEditTechnician] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const itemsPerPage = 10;

  // Fetch technicians function moved outside of useEffect to make it accessible in handleDeleteTechnician
  const fetchTechnicians = async () => {
    try {
      const response = await axios.get(baseurl + "/api/allUsers");
      const filteredTechnicians = (response.data.data || []).filter(
        (technician) => technician.role === "technician"
      );
      setTechnicians(filteredTechnicians);
    } catch (error) {
      console.error("Error fetching technicians:", error);
      setTechnicians([]);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const filteredTechnicians = technicians.filter((technician) =>
    Object.values(technician).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const indexOfLastTechnician = currentPage * itemsPerPage;
  const indexOfFirstTechnician = indexOfLastTechnician - itemsPerPage;
  const currentTechnicians = filteredTechnicians.slice(
    indexOfFirstTechnician,
    indexOfLastTechnician
  );
  const totalPages = Math.ceil(filteredTechnicians.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
  };

  const fetchTechnicianDetails = async (uid) => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseurl}/api/userprofile/${uid}`);

      if (response.data && response.data.data) {
       return response.data.data;
        // setIsViewModalOpen(true);
      } else {
        console.error("Technician details not found");
      }
    } catch (error) {
      console.error("Error fetching technician details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTechnician = async (technician) => {
    const details = await fetchTechnicianDetails(technician.uid);
    if (details) {
      setViewTechnician(details);
      setIsViewModalOpen(true);
    }
  };

  const handleEditTechnician = async (technician) => {
    const details = await fetchTechnicianDetails(technician.uid);
    if (details) {
      setEditTechnician(details);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEditTechnician = async () => {
    try {
      setLoading(true);
      
      // Use the new API endpoint with the specific user ID
      const response = await axios.put(`${baseurl}/api/user/${editTechnician.uid}`, editTechnician);
      
      if (response.data) {
        // Update the technicians list
        await fetchTechnicians();
        
        // Show success message
        await Swal.fire({
          title: "Updated!",
          text: "Technician details have been updated successfully.",
          icon: "success",
          confirmButtonColor: "#F24E1E",
        });
        
        // Close the edit modal
        setIsEditModalOpen(false);
        setEditTechnician(null);
      } else {
        throw new Error("Failed to update Technician");
      }
    } catch (error) {
      console.error("Error updating technician:", error);
  
      // Show error message
      await Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "An error occurred while updating the technician. Please try again later.",
        icon: "error",
        confirmButtonColor: "#F24E1E",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditTechnician(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditTechnician(null);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewTechnician(null);
  };

  const handleAddTechnician = () => {
    console.log("Add Technician clicked");
  };

  const handleDeleteTechnician = async (uid) => {
    // Show confirmation SweetAlert
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F24E1E",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    // If user confirmed
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${baseurl}/api/deleteUser/${uid}`);

        if (response.status === 204) {
          await fetchTechnicians(); // Now fetchTechnicians is defined and accessible

          // Show success message
          await Swal.fire({
            title: "Deleted!",
            text: "Technician has been deleted successfully.",
            icon: "success",
            confirmButtonColor: "#F24E1E",
          });
        } else {
          throw new Error("Failed to delete Technician");
        }
      } catch (error) {
        console.error("Error deleting technician:", error);

        // Show error message
        await Swal.fire({
          title: "Error!",
          text:
            error.response?.data?.message ||
            "An error occurred while deleting the transport. Please try again later.",
          icon: "error",
          confirmButtonColor: "#F24E1E",
        });
      }
    }
  };

  return (
    <div className="container mt-4">
      {/* Search box and Add Technician button */}
      <div className="row mb-3">
        <div className="col-8 col-md-8">
          <input
            type="text"
            className="form-control rounded-2 px-4"
            placeholder="Search Technician"
            id="technicianSearchBox"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="col-4 col-md-4">
          {/* <button
            id="addProductBtn"
            className="btn p-3 d-flex align-items-center justify-content-center"
            onClick={handleAddTechnician}
          >
            <i className="bi bi-plus-circle me-2"></i>
            <span className="d-none d-sm-inline">Add Technicians</span>
            <span className="d-inline d-sm-none">Add</span>
          </button> */}
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="bg-light">
            <tr>
              <th className="py-3 px-4">S.No</th>
              <th className="py-3 px-4">Full Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Mobile Number</th>
              <th className="py-3 px-4">City</th>
              <th className="py-3 px-4">State</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTechnicians.length > 0 ? (
              currentTechnicians.map((technician, index) => (
                <tr key={technician.uid}>
                  <td>{indexOfFirstTechnician + index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="d-flex align-items-center gap-2">
                      <div className="technician-icon bg-primary text-white rounded-circle d-flex justify-content-center align-items-center">
                        <User color="white" size={20} />
                      </div>
                      {technician.full_name || "Not assigned"}
                    </div>
                  </td>
                  <td className="py-3 px-4">{technician.email}</td>
                  <td className="py-3 px-4">
                    {technician.mobile_number || "Not assigned"}
                  </td>
                  <td className="py-3 px-4">
                    {technician.city || "Not assigned"}
                  </td>
                  <td className="py-3 px-4">
                    {technician.state || "Not assigned"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-link p-0"
                        onClick={() => handleViewTechnician(technician)}
                        disabled={loading}
                      >
                        <Eye size={20} className="text-primary" />
                      </button>
                      <button
                        className="btn btn-link p-0"
                        onClick={() => handleEditTechnician(technician)}
                      >
                        <PencilLine size={20} className="text-info" />
                      </button>
                      <button
                        className="btn btn-link p-0"
                        onClick={() => handleDeleteTechnician(technician.uid)}
                      >
                        <Trash2 size={20} className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No technicians found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        className="productPagination container d-flex mt-2"
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="results-count text-center mb-3" style={{ gap: "10px" }}>
          Showing{" "}
          {currentTechnicians.length === 0 ? "0" : indexOfFirstTechnician + 1}{" "}
          to {Math.min(indexOfLastTechnician, filteredTechnicians.length)} of{" "}
          {filteredTechnicians.length} entries
        </div>
        <Pagination>
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages)].map((_, pageIndex) => (
            <Pagination.Item
              key={pageIndex}
              active={pageIndex + 1 === currentPage}
              onClick={() => handlePageChange(pageIndex + 1)}
            >
              {pageIndex + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
      {isViewModalOpen && viewTechnician && (
        <div className="modal-overlay" onClick={closeViewModal}>
          <div
            className="modal-content technician-modal w-75"
            onClick={(e) => e.stopPropagation()}
            style={{
              marginTop: "70px",
              backgroundColor: "#ffffff",
              height: "70vh",
              overflowY: "auto", // Makes the modal content scrollable
            }}
          >
            <div className="modal-header d-flex justify-content-between align-items-center mb-4">
              <h2>Technician Details</h2>
              <button
                onClick={closeViewModal}
                className="btn-close"
                aria-label="Close"
              ></button>
            </div>
            <div className="technician-details">
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">Full Name:</label>
                    <p className="detail-value">
                      {viewTechnician.full_name || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">Username:</label>
                    <p className="detail-value">
                      {viewTechnician.username || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">Email:</label>
                    <p className="detail-value">
                      {viewTechnician.email || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">Mobile Number:</label>
                    <p className="detail-value">
                      {viewTechnician.mobile_number || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">City:</label>
                    <p className="detail-value">
                      {viewTechnician.city || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">State:</label>
                    <p className="detail-value">
                      {viewTechnician.state || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">Address:</label>
                    <p className="detail-value">
                      {viewTechnician.address || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">City:</label>
                    <p className="detail-value">
                      {viewTechnician.city || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">Created At:</label>
                    <p className="detail-value">
                      {viewTechnician.createdAt
                        ? new Date(viewTechnician.createdAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editTechnician && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div
            className="modal-content technician-modal w-75"
            onClick={(e) => e.stopPropagation()}
            style={{
              marginTop: "70px",
              backgroundColor: "#ffffff",
              height: "50vh",
              overflowY: "auto",
            }}
          >
            <div className="modal-header d-flex justify-content-between align-items-center mb-4">
              <h2>Edit Technician</h2>
              <div>

                <button
                  onClick={closeEditModal}
                  className="btn"
                  disabled={loading}
                >
                  <X size={20} className="me-2" />
                </button>
              </div>
            </div>
            <div className="technician-details">
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      className="form-control"
                      value={editTechnician.full_name || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">Username</label>
                    <input
                      type="text"
                      name="username"
                      className="form-control"
                      value={editTechnician.username || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={editTechnician.email || ''}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobile_number"
                      className="form-control"
                      value={editTechnician.mobile_number || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      value={editTechnician.city || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">Address</label>
                    <input
                      type="text"
                      name="address"
                      className="form-control"
                      value={editTechnician.address || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="text-center">
              <button
                  onClick={handleSaveEditTechnician}
                  className="btn me-2"
                  style={{ backgroundColor: "#F24E1E", color: "#fff" }}
                  disabled={loading}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Technicians;
