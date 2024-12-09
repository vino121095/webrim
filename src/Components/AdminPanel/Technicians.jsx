import React, { useState, useEffect } from 'react';
import { Pagination } from 'react-bootstrap';
import { User, Plus } from 'lucide-react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import axios from 'axios';
import baseurl from '../ApiService/ApiService';
import './AdminPanel.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Technicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 6;
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const response = await axios.get(baseurl + '/api/allUsers');
        // Filter technicians with role 'technician' right when setting the state
        const filteredTechnicians = (response.data.data || []).filter(
          technician => technician.role === 'technician'
        );
        setTechnicians(filteredTechnicians);
      } catch (error) {
        console.error('Error fetching technicians:', error);
        setTechnicians([]);
      }
    };
  
    fetchTechnicians();
  }, []);

  const filteredTechnicians = technicians.filter((technician) =>
    Object.values(technician).some((value) =>
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  

  const indexOfLastTechnician = currentPage * itemsPerPage;
  const indexOfFirstTechnician = indexOfLastTechnician - itemsPerPage;
  const currentTechnicians = filteredTechnicians.slice(indexOfFirstTechnician, indexOfLastTechnician);
  const totalPages = Math.ceil(filteredTechnicians.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
  };

  const handleAddTechnician = () => {
    console.log('Add Technician clicked');
  };

  return (
    <div className="container mt-4">
    {/* Search box and Add Technician button */}
    <div className="row mb-3">
      {/* Search box */}
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
      {/* Add Technician button */}
      <div className="col-4 col-md-4">
      <button
        id="addProductBtn"
        className="btn p-3 d-flex align-items-center justify-content-center"
        onClick={handleAddTechnician}
      >
        <i className="bi bi-plus-circle me-2"></i>
          <span className="d-none d-sm-inline">Add Technicians</span>
          <span className="d-inline d-sm-none">Add</span>
      </button>
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
                      {technician.full_name || 'Not assigned'}
                    </div>
                  </td>
                  <td className="py-3 px-4">{technician.email}</td>
                  <td className="py-3 px-4">{technician.mobile_number || 'Not assigned'}</td>
                  <td className="py-3 px-4">{technician.city || 'Not assigned'}</td>
                  <td className="py-3 px-4">{technician.state || 'Not assigned'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No technicians found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center flex-wrap mt-3">
        <div className="mb-3 mb-md-0">
          Showing {currentTechnicians.length === 0 ? '0' : indexOfFirstTechnician + 1} to{' '}
          {Math.min(indexOfLastTechnician, filteredTechnicians.length)} of {filteredTechnicians.length} entries
        </div>
        <Pagination className="mb-0">
          <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            <MdChevronLeft />
          </Pagination.Prev>
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index + 1}
              active={currentPage === index + 1}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            <MdChevronRight />
          </Pagination.Next>
        </Pagination>
      </div>
    </div>
  );
};

export default Technicians;
