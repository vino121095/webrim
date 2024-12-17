import React, { useState, useEffect } from "react";
import { Pagination } from "react-bootstrap";
import "./AdminPanel.css";
import { Upload, Eye, PencilLine, Trash2, X, Archive, ArchiveX } from "lucide-react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import axios from "axios";
import baseurl from "../ApiService/ApiService";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Swal from "sweetalert2";

const Distributors = () => {
  const navigate = useNavigate();
  const [distributors, setDistributors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDistributor, setCurrentDistributor] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const itemsPerPage = 6;
  const [activeTab, setActiveTab] = useState("all");
  const [archiveDistributors, setArchiveDistributors] = useState([]);
  // const [newDistributors, setNewDistributors] = useState([]);

  // Validation functions
  const validateGSTNumber = (gst) => {
    const gstPattern =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gst) return "GST Number is required";
    if (!gstPattern.test(gst)) return "Invalid GST Number format";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])/.test(password))
      return "Password must include lowercase letter";
    if (!/(?=.*[A-Z])/.test(password))
      return "Password must include uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Password must include number";
    if (!/(?=.*[!@#$%^&*])/.test(password))
      return "Password must include special character";
    return "";
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailPattern.test(email)) return "Invalid email format";
    return "";
  };

  const validatePhone = (phone) => {
    const phonePattern = /^[6-9]\d{9}$/;
    if (!phone) return "Phone number is required";
    if (!phonePattern.test(phone)) return "Invalid phone number format";
    return "";
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      fetchDistributors();
    }
  }, [searchQuery]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to the first page when changing tabs
  }

  const fetchDistributors = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/getAllDistributors`);
      setDistributors(response.data || []);
      setArchiveDistributors(response.data.filter(distributor => distributor.isarchived));
      // setNewDistributors(data.filter(distributor => distributor.isNew));
    } catch (error) {
      console.error("Error fetching distributors:", error);
      setDistributors([]);
      setArchiveDistributors([]);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchDistributors();
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(
        `${baseurl}/api/searchDistributor?query=${encodeURIComponent(
          searchQuery.trim()
        )}`
      );
      setDistributors(response.data || []);
      setCurrentPage(1);
    } catch (error) {
      if (error.response?.status === 404) {
        setDistributors([]);
      } else {
        console.error("Error searching distributors:", error);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentDistributor((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user starts typing
    setValidationErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Validate fields
    switch (name) {
      case "gstnumber":
        setValidationErrors((prev) => ({
          ...prev,
          gstnumber: validateGSTNumber(value),
        }));
        break;
      case "password":
        setValidationErrors((prev) => ({
          ...prev,
          password: validatePassword(value),
        }));
        break;
      case "email":
        setValidationErrors((prev) => ({
          ...prev,
          email: validateEmail(value),
        }));
        break;
      case "phoneno":
        setValidationErrors((prev) => ({
          ...prev,
          phoneno: validatePhone(value),
        }));
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate all required fields
    const errors = {
      gstnumber: validateGSTNumber(currentDistributor?.gstnumber),
      password: currentDistributor?.did ? "" : validatePassword(currentDistributor?.password),
      email: validateEmail(currentDistributor?.email),
      phoneno: validatePhone(currentDistributor?.phoneno),
    };

    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some((error) => error !== "");
    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }

    // Image validation
    if (imageFiles.length === 0 && existingImages.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    if (imageFiles.length > 1 && existingImages.length > 1) {
      setError("You can upload only one image.");
      return;
    }

    try {
      const formData = new FormData();

      // Add all distributor fields
      const distributorData = {
        companyname: currentDistributor?.companyname || "",
        location: currentDistributor?.location || "",
        gstnumber: currentDistributor?.gstnumber || "",
        creditlimit: currentDistributor?.creditlimit || "",
        contact_person_name: currentDistributor?.contact_person_name || "",
        phoneno: currentDistributor?.phoneno || "",
        email: currentDistributor?.email || "",
        password: currentDistributor?.password || "",
      };

      Object.entries(distributorData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (currentDistributor?.did) {
        formData.append("did", currentDistributor.did);
        if (existingImages.length > 0) {
          formData.append("existingImages", JSON.stringify(existingImages));
        }
      }

      imageFiles.forEach((file) => {
        formData.append("image", file);
      });

      const url = currentDistributor?.did
        ? `${baseurl}/api/updateDistributorById/${currentDistributor.did}`
        : `${baseurl}/api/addDistributor`;

      const response = await axios({
        method: currentDistributor?.did ? "put" : "post",
        url,
        data: formData,
      });

      if (response.status === 201 || response.status === 200) {
        const iconType =
          response.data.message === "Distributor added successfully" ||
            response.data.message === "Distributor updated successfully"
            ? "success"
            : "error";

        Swal.fire({
          title: iconType === "success" ? "Good job!" : "Oops",
          text: response.data.message || "Operation successful!",
          icon: iconType,
          confirmButtonColor: "#F24E1E",
        });

        fetchDistributors();
        resetForm();
        toggleModal();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to save distributor",
        icon: "error",
        confirmButtonColor: "#F24E1E",
      });
    }
  };

  const resetForm = () => {
    setCurrentDistributor(null);
    setImageFiles([]);
    setExistingImages([]);
    setError("");
    setValidationErrors({});
  };

  const handleViewDetails = (distributor) => {
    navigate(`DistributorsViewDetails/${distributor.did}`);
  };

  const handleEditDistributor = (distributor) => {
    setCurrentDistributor(distributor);
    setExistingImages(
      distributor.image?.map((img, index) => ({
        id: index,
        image_path: img.image_path,
      })) || []
    );
    setIsModalOpen(true);
    setError("");
    setValidationErrors({});
  };

  const handleDeleteDistributor = async (distributor) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F24E1E",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `${baseurl}/api/deleteDistributorById/${distributor.did}`
          );

          Swal.fire({
            title: "Deleted!",
            text: "Distributor deleted successfully.",
            icon: "success",
            confirmButtonColor: "#F24E1E",
          });

          fetchDistributors();
        } catch (error) {
          console.error("Error deleting distributor:", error);

          Swal.fire({
            title: "Error!",
            text: "Failed to delete distributor",
            icon: "error",
            confirmButtonColor: "#F24E1E",
          });
        }
      }
    });
  };

  const handleDeleteImage = (imageIndex) => {
    setExistingImages((prev) =>
      prev.filter((_, index) => index !== imageIndex)
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const existingFileNames = imageFiles.map((file) => file.name);

    const newFiles = files.filter(
      (file) => !existingFileNames.includes(file.name)
    );

    if (newFiles.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Oops...",
        text: "File already added",
        confirmButtonText: "OK",
      });
    } else {
      setImageFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
    e.target.value = "";
  };

  const removeNewImage = (index) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      resetForm();
    }
  };
 
  // Pagination calculations
  const indexOfLastDistributor = currentPage * itemsPerPage;
  const indexOfFirstDistributor = indexOfLastDistributor - itemsPerPage;
  
  let currentDistributors = [];
  let totalItems = 0;
  
  if (activeTab === "all") {
    currentDistributors = distributors.slice(indexOfFirstDistributor, indexOfLastDistributor);
    totalItems = distributors.length; // Total distributors
  } else if (activeTab === "archive") {
    currentDistributors = archiveDistributors.slice(indexOfFirstDistributor, indexOfLastDistributor);
    totalItems = archiveDistributors.length; // Total archive distributors
  }
  
  // Calculate total pages based on the total number of items
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
  };
  


  const handleArchive = async (distributor, isArchive) => {
    // Confirmation message based on action
    const title = isArchive ? 'Archive this distributor?' : 'Remove from archive?';
    const confirmButtonText = isArchive ? 'Yes, archive it!' : 'Yes, remove it!';
    const successMessage = isArchive ? 'Distributor archived successfully!' : 'Distributor removed from archive successfully!';
  
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText,
    });
  
    if (result.isConfirmed) {
      try {
        // Determine the correct API endpoint based on action
        const endpoint = isArchive
          ? `${baseurl}/api/archiveDistributor/${distributor.did}`
          : `${baseurl}/api/unarchiveDistributor/${distributor.did}`;
        
        // Send API request
        const response = await axios.put(endpoint);
  
        if (response.status === 200) {
          Swal.fire('Success!', successMessage, 'success');
          // Optionally, refresh or update your state here
        } else {
          Swal.fire('Error!', response.data.message || 'Failed to process.', 'error');
        }
      } catch (error) {
        Swal.fire('Error!', error.response?.data?.message || 'Something went wrong.', 'error');
      }
    }
    fetchDistributors();
  };
  


  return (
    <div className="container-fluid py-4">
      {/* Search and Add Section */}
      <div className="searches row align-items-center gx-3 mt-3 mb-3">
        <div className="col-8 col-md-8">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search Distributor"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="col-4 col-md-4">
          <button
            id="addProductBtn"
            className="btn p-3 d-flex align-items-center justify-content-center"
            onClick={toggleModal}
          >
            <i className="bi bi-plus-circle me-2"></i>
            <span className="d-none d-sm-inline">Add Distributor</span>
            <span className="d-inline d-sm-none">Add</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === "all" ? "active" : ""}`}
            onClick={() => handleTabChange("all")}
          >
            All Distributors
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === "archive" ? "active" : ""}`}
            onClick={() => handleTabChange("archive")}
          >
            Archive
          </a>
        </li>
        {/* <li className="nav-item">
          <a
            className={`nav-link ${activeTab === "new" ? "active" : ""}`}
            onClick={() => handleTabChange("new")}
          >
            New Distributors
          </a>
        </li> */}
      </ul>

      {/* Table Section */}
      <div className="container-fluid p-0 mt-5">
        <div className="row">
          <div className="col-12">
            <div className="table-responsive">
              <div className="shadow-sm rounded bg-white">
                <table className="table table-striped table-hover mb-0 align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th className="py-3 px-4">S.No</th>
                      <th className="py-3 px-4">Organization Name</th>
                      <th className="py-3 px-4">Contact Person</th>
                      <th className="py-3 px-4">Contact Number</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDistributors?.map((distributor, index) => (
                      <tr key={index}>
                        <td className="py-3 px-4">
                          {indexOfFirstDistributor + index + 1}
                        </td>
                        <td className="py-3 px-4">{distributor.companyname}</td>
                        <td className="py-3 px-4">
                          {distributor.contact_person_name}
                        </td>
                        <td className="py-3 px-4">
                          {distributor.phoneno || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-link p-0"
                              onClick={() => handleViewDetails(distributor)}
                            >
                              <Eye className="text-primary" size={20} />
                            </button>
                            <button
                              className="btn btn-link p-0"
                              onClick={() => handleEditDistributor(distributor)}
                            >
                              <PencilLine className="text-info" size={20} />
                            </button>
                            <button
                              className="btn btn-link p-0"
                              onClick={() =>
                                handleDeleteDistributor(distributor)
                              }
                            >
                              <Trash2 className="text-danger" size={20} />
                            </button>
                            {activeTab === 'all' ? (
                              <button
                                className="btn btn-link p-0"
                                onClick={() => handleArchive(distributor, true)} // Archive action
                              >
                                <Archive className="text-primary" size={20} />
                              </button>
                            ) : activeTab === 'archive' ? (
                              <button
                                className="btn btn-link p-0"
                                onClick={() => handleArchive(distributor, false)} // Unarchive action
                              >
                                <ArchiveX className="text-danger" size={20} />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="distributorpagination container d-flex mt-2 justify-content-between">
        <div className="results-count text-center mb-3">
          Showing{" "}
          {currentDistributors.length === 0 ? "0" : indexOfFirstDistributor + 1}{" "}
          to {Math.min(indexOfLastDistributor, distributors.length)} of{" "}
          {distributors.length} entries
        </div>
        <Pagination
          className="justify-content-center align-items-center"
          style={{ gap: "5px" }}
        >
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <MdChevronLeft />
          </Pagination.Prev>

          {/* First page */}
          <Pagination.Item
            active={currentPage === 1}
            onClick={() => handlePageChange(1)}
          >
            1
          </Pagination.Item>

          {/* Show dots if there are many pages before current page */}
          {currentPage > 3 && (
            <Pagination.Ellipsis disabled>...</Pagination.Ellipsis>
          )}

          {/* Pages around current page */}
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            if (
              pageNumber !== 1 &&
              pageNumber !== totalPages &&
              Math.abs(currentPage - pageNumber) <= 1
            ) {
              return (
                <Pagination.Item
                  key={pageNumber}
                  active={currentPage === pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </Pagination.Item>
              );
            }
            return null;
          })}

          {/* Show dots if there are many pages after current page */}
          {currentPage < totalPages - 2 && (
            <Pagination.Ellipsis disabled>...</Pagination.Ellipsis>
          )}

          {/* Last page */}
          {totalPages > 1 && (
            <Pagination.Item
              active={currentPage === totalPages}
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </Pagination.Item>
          )}

          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <MdChevronRight />
          </Pagination.Next>
        </Pagination>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content distributor-form">
              <div className="modal-header">
                <h5 className="modal-title">
                  {currentDistributor?.did
                    ? "Edit Distributor"
                    : "Distributor Registration"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={toggleModal}
                ></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Company Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="companyname"
                        placeholder="Enter company name"
                        onChange={handleInputChange}
                        value={currentDistributor?.companyname || ""}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        name="location"
                        placeholder="Enter location"
                        onChange={handleInputChange}
                        value={currentDistributor?.location || ""}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">GST Number</label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.gstnumber ? "is-invalid" : ""
                          }`}
                        name="gstnumber"
                        placeholder="Enter GST number"
                        onChange={handleInputChange}
                        value={currentDistributor?.gstnumber || ""}
                      />
                      {validationErrors.gstnumber && (
                        <div className="invalid-feedback">
                          {validationErrors.gstnumber}
                        </div>
                      )}
                    </div>
                    <div className="col-12">
                      <label className="form-label">Credit Limit</label>
                      <input
                        type="text"
                        className="form-control"
                        name="creditlimit"
                        placeholder="Enter credit limit"
                        onChange={handleInputChange}
                        value={currentDistributor?.creditlimit || ""}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Contact Person Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="contact_person_name"
                        placeholder="Enter contact person's name"
                        onChange={handleInputChange}
                        value={currentDistributor?.contact_person_name || ""}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className={`form-control ${validationErrors.phoneno ? "is-invalid" : ""
                          }`}
                        name="phoneno"
                        placeholder="Enter phone number"
                        onChange={handleInputChange}
                        value={currentDistributor?.phoneno || ""}
                      />
                      {validationErrors.phoneno && (
                        <div className="invalid-feedback">
                          {validationErrors.phoneno}
                        </div>
                      )}
                    </div>
                    <div className="col-12">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className={`form-control ${validationErrors.email ? "is-invalid" : ""
                          }`}
                        name="email"
                        placeholder="Enter email"
                        onChange={handleInputChange}
                        value={currentDistributor?.email || ""}
                      />
                      {validationErrors.email && (
                        <div className="invalid-feedback">
                          {validationErrors.email}
                        </div>
                      )}
                    </div>
                    <div className="col-12">
                      <label className="form-label">Password</label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.password && !currentDistributor?.did ? "is-invalid" : ""
                          }`}
                        name="password"
                        placeholder="Enter password"
                        onChange={handleInputChange}
                        value={currentDistributor?.password || ""}
                      />
                      {!currentDistributor?.did && validationErrors.password && (
                        <div className="invalid-feedback">
                          {validationErrors.password}
                        </div>
                      )}
                    </div>

                    {/* Image Upload Section */}
                    <div className="d-flex justify-content-center flex-column align-items-center">
                      <label className="form-label">Upload Images</label>
                      <div className="d-flex gap-3 flex-wrap">
                        {/* Existing Images */}
                        {existingImages.map((image, index) => (
                          <div
                            key={`existing-${index}`}
                            className="position-relative"
                          >
                            <img
                              src={`${baseurl}/${image.image_path}`}
                              alt={`Existing ${index}`}
                              className="rounded"
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0"
                              onClick={() => handleDeleteImage(index)}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}

                        {/* New Images */}
                        {imageFiles.map((file, index) => (
                          <div
                            key={`new-${index}`}
                            className="position-relative"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`New ${index}`}
                              className="rounded"
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0"
                              onClick={() => removeNewImage(index)}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}

                        {/* Upload Button */}
                        <label
                          className="d-flex align-items-center justify-content-center border rounded"
                          style={{
                            width: "100px",
                            height: "100px",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="file"
                            multiple
                            onChange={handleImageChange}
                            className="d-none"
                          />
                          <Upload size={24} className="text-muted" />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mt-4">
                    <button
                      type="submit"
                      className="btn px-4"
                      style={{ background: "#F24E1E", color: "white" }}
                      onClick={handleSubmit}
                    >
                      {currentDistributor?.did ? "Update" : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {isModalOpen && <div className="modal-backdrop show"></div>}
    </div>
  );
};

export default Distributors;
