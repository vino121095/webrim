import React, { useState, useEffect } from "react";
import { Eye, PencilLine, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import baseurl from "../ApiService/ApiService";
import "./AdminPanel.css";
import Swal from "sweetalert2";
import { Pagination } from "react-bootstrap";

const Transport = () => {
  const [transports, setTransports] = useState([]);
  const [filteredTransports, setFilteredTransports] = useState([]);
  const [searchLocation, setSearchLocation] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewTransport, setViewTransport] = useState(null);
  const [currentTransport, setCurrentTransport] = useState({
    travels_name: "",
    location: "",
    dirver_name: "",
    contact_person_name: "",
    phone: "",
    email: "",
  });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchTransport();
  }, []);

  const fetchTransport = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/transport`);
      if (response.data && Array.isArray(response.data)) {
        const validTransports = response.data.filter(
          (transport) => transport && typeof transport === "object"
        );
        setTransports(validTransports);
        setFilteredTransports(validTransports);
      } else {
        console.error("Invalid response format:", response.data);
        setTransports([]);
        setFilteredTransports([]);
      }
    } catch (error) {
      console.error("Error fetching transports:", error);
      setTransports([]);
      setFilteredTransports([]);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransports.length / itemsPerPage);

  // Page change handler
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  // Get unique locations for dropdown
  const getUniqueLocations = () => {
    return [...new Set(transports.map(transport => transport.location))];
  };

  const handleSearch = () => {
    if (!searchLocation) {
      setFilteredTransports(transports);
    } else {
      const filtered = transports.filter((transport) => 
        transport.location === searchLocation
      );
      setFilteredTransports(filtered);
    }
    setCurrentPage(1); // Reset to first page when searching
  };

  const fetchTransportDetails = async (tid) => {
    try {
      const response = await axios.get(`${baseurl}/api/transport/${tid}`);
      if (response.data && response.data) {
        setViewTransport(response.data);
        setIsViewModalOpen(true);
      } else {
        throw new Error("Transport details not found");
      }
    } catch (error) {
      console.error("Error fetching transport details:", error);
      alert("Failed to fetch transport details. Please try again later.");
    }
  };

  const handleViewTransport = async (transport) => {
    await fetchTransportDetails(transport.tid);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewTransport(null);
  };

  const toggleModal = () => {
    setIsModalOpen((prev) => {
      // Reset form only when closing the modal or opening it fresh
      if (!prev) {
        setCurrentTransport({
          travels_name: "",
          location: "",
          dirver_name: "",
          contact_person_name: "",
          phone: "",
          email: "",
        });
      }
      return !prev;
    });
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Convert transportName to travels_name in the handler
    const fieldName = name === "transportName" ? "travels_name" : name;
    setCurrentTransport((prev) => ({ ...prev, [fieldName]: value }));
  };

  const validateForm = () => {
    if (
      !currentTransport.travels_name ||
      !currentTransport.location ||
      !currentTransport.dirver_name
    ) {
      alert("Please fill in all required fields!");
      return false;
    }

    // Validate phone number format
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(currentTransport.phone)) {
      alert("Please enter a valid 10-digit phone number!");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentTransport.email)) {
      alert("Please enter a valid email address!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
  
    try {
      if (currentTransport.tid) {
        // Update existing transport
        const response = await axios.put(
          `${baseurl}/api/updatetransport/${currentTransport.tid}`,
          currentTransport
        );
  
        if (response.status === 200) {
          setTransports((prev) =>
            prev.map((transport) =>
              transport.tid === currentTransport.tid ? response.data : transport
            )
          );
  
          // Success alert for update
          await Swal.fire({
            title: "Good job!",
            text: "Transport updated successfully!",
            icon: "success",
            confirmButtonColor: "#F24E1E",
          });
        }
        await fetchTransport();
      } else {
        // Add new transport
        const response = await axios.post(
          `${baseurl}/api/addtransport`,
          currentTransport
        );
  
        if (response.status === 200 || response.status === 201) {
          // Success alert for new addition
          await Swal.fire({
            title: "Good job!",
            text: "Transport added successfully!",
            icon: "success",
            confirmButtonColor: "#F24E1E",
          });
  
          await fetchTransport(); // Refresh the list after successful addition
        } else {
          throw new Error("Failed to add transport");
        }
      }
  
      toggleModal(); // Close and reset the modal
    } catch (error) {
      console.error("Error adding/updating transport:", error);
  
      // Error alert
      await Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "An error occurred while saving the transport. Please try again later.",
        icon: "error",
        confirmButtonColor: "#F24E1E",
      });
    }
  };
  

  const handleEditTransport = (transport) => {
    setCurrentTransport({
      ...transport,
      phone: transport.phone || "",
      email: transport.email || "",
    });
    setIsModalOpen(true);

  };

const handleDeleteTransport = async (transport) => {
    // Show confirmation SweetAlert
    const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#F24E1E",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    });

    // If user confirmed
    if (result.isConfirmed) {
        try {
            const response = await axios.delete(
                `${baseurl}/api/deletetransport/${transport.tid}`
            );

            if (response.status === 204) {
                await fetchTransport();
                
                // Show success message
                await Swal.fire({
                    title: "Deleted!",
                    text: "Transport has been deleted successfully.",
                    icon: "success",
                    confirmButtonColor: "#F24E1E"
                });
            } else {
                throw new Error("Failed to delete transport");
            }
        } catch (error) {
            console.error("Error deleting transport:", error);
            
            // Show error message
            await Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || 
                      "An error occurred while deleting the transport. Please try again later.",
                icon: "error",
                confirmButtonColor: "#F24E1E"
            });
        }
    }
};

  return (
    <>
      <div className="container mt-3 bg-white p-4 rounded shadow-sm">
      <div className="row align-items-center">
        <div className="col-8 col-md-6 mb-3">
          <select
            className="form-select"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
          >
            <option value="">Select Location</option>
            {getUniqueLocations().map((location, index) => (
              <option key={index} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
        <div className="col-4 col-md-3 mb-3">
          <button 
            className="btn w-100" 
            id="search-location"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        <div className="col-12 col-md-3 mb-3 text-md-end">
          <button className="btn add-transport-btn w-sm-100 w-md-auto" onClick={toggleModal}>
            <i className="bi bi-plus-circle me-2"></i> Add Transport
          </button>
        </div>
      </div>
    </div>

      {/* Responsive Table */}
      <div className="container-fluid p-0 mt-5">
        <div className="row">
          <div className="col-12">
            <div className="table-responsive">
              <div className="shadow-sm rounded bg-white">
                <table className="table table-striped table-hover mb-0 align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th className="py-3 px-4">S.No</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Travel Name</th>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">Driver Name</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((transport, index) => (
                        <tr key={transport.tid || index}>
                          <td className="py-3 px-4">{indexOfFirstItem + index + 1}</td>
                          <td className="py-3 px-4">{transport.location || "N/A"}</td>
                          <td className="py-3 px-4">{transport.travels_name || "N/A"}</td>
                          <td className="py-3 px-4">{transport.phone || "N/A"}</td>
                          <td className="py-3 px-4">{transport.dirver_name || "N/A"}</td>
                          <td className="py-3 px-4">
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-link p-0"
                                onClick={() => handleViewTransport(transport)}
                              >
                                <Eye size={20} className="text-primary" />
                              </button>
                              <button
                                className="btn btn-link p-0"
                                onClick={() => handleEditTransport(transport)}
                              >
                                <PencilLine size={20} className="text-info" />
                              </button>
                              <button
                                className="btn btn-link p-0"
                                onClick={() => handleDeleteTransport(transport)}
                              >
                                <Trash2 size={20} className="text-danger" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          {searchLocation 
                            ? `No transports found for ${searchLocation}` 
                            : "No transports found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
       <div className="container d-flex justify-content-between align-items-center mt-4">
        <div className="showing-entries">
          Showing {filteredTransports.length > 0 ? indexOfFirstItem + 1 : 0} to{" "}
          {Math.min(indexOfLastItem, filteredTransports.length)} of{" "}
          {filteredTransports.length} entries
        </div>
        <nav aria-label="Transport pagination">
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
              </button>
            </li>
            {getPageNumbers().map(number => (
              <li 
                key={number} 
                className={`page-item ${currentPage === number ? 'active' : ''}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(number)}
                >
                  {number}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={20} />
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* View Transport Modal */}
      {isViewModalOpen && viewTransport && (
        <div className="modal-overlay" onClick={closeViewModal}>
          <div className="modal-content transport-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header d-flex justify-content-between align-items-center mb-4">
              <h2>Transport Details</h2>
              <button onClick={closeViewModal} className="btn-close" aria-label="Close"></button>
            </div>
            <div className="transport-details">
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">Transport Name:</label>
                    <p className="detail-value">{viewTransport.travels_name || 'N/A'}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">Location:</label>
                    <p className="detail-value">{viewTransport.location || 'N/A'}</p>
                  </div>
                </div>
              </div>
  
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">Driver Name:</label>
                    <p className="detail-value">{viewTransport.dirver_name || 'N/A'}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">Contact Person:</label>
                    <p className="detail-value">{viewTransport.contact_person_name || 'N/A'}</p>
                  </div>
                </div>
              </div>
  
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">Phone Number:</label>
                    <p className="detail-value">{viewTransport.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-group">
                    <label className="fw-bold">Email:</label>
                    <p className="detail-value">{viewTransport.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Transport Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={toggleModal}>
          <div className="modal-content mt-3 transport-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={toggleModal}
              aria-label="Close Modal"
            >
              &times;
            </button>
            
            <h2>{currentTransport.tid ? "Edit Transport" : "Add Transport"}</h2>
            <form onSubmit={handleSubmit} className="transport-registration-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Transport Name</label>
                  <input
                    type="text"
                    name="transportName"
                    value={currentTransport.travels_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={currentTransport.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Driver Name</label>
                  <input
                    type="text"
                    name="dirver_name"
                    value={currentTransport.dirver_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row d-flex flex-column">
                <p>Who can we contact for this transport?</p>
                <div className="d-flex justify-content-around flex-row gap-3">
                  <div className="form-group w-100">
                    <label>Contact Person Name</label>
                    <input
                      type="text"
                      name="contact_person_name"
                      value={currentTransport.contact_person_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group w-100">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={currentTransport.phone}
                      onChange={handleInputChange}
                      required
                      pattern="\d{10}"
                      title="Please enter a 10-digit phone number"
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={currentTransport.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="btn-submit p-3"
                style={{
                  backgroundColor: '#F24E1E', 
                  border: 'none', 
                  color: 'white', 
                  borderRadius: '10px'
                }}
              >
                {currentTransport.tid ? "Update" : "Add Transport"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Transport;