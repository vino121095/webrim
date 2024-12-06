import React, { useState, useEffect } from 'react';
import { Pagination } from 'react-bootstrap';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import axios from 'axios';
import baseurl from '../ApiService/ApiService';
import ShipmentsDetails from './ShipmentsDetails';
import { useNavigate } from 'react-router-dom';

const OrderSummary = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('All Orders');
  const [selectedOrderOid, setSelectedOrderOid] = useState(null);
  const [showShipmentDetails, setShowShipmentDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // New state for search
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${baseurl}/api/orders`);
        setOrders(response.data.data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchOrders();
  }, []);

  // Combine filtering and searching logic
  const filteredAndSearchedOrders = orders.filter(order => {
    // Filter by status
    const statusMatch = activeFilter === 'All Orders' || order.status === activeFilter;
    
    // Search logic (case-insensitive)
    const searchMatch = !searchTerm || 
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });
  
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filteredAndSearchedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredAndSearchedOrders.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleShipmentClick = (oid) => {
    navigate(`/AdminDashboard/Shipments/${oid}`); 
  };

  const statusStyles = {
    'Received': {
      color: '#267309',
      background: '#E7F7E1',
      borderRadius: '10px',
      padding: '6px 12px',
      display: 'inline-block'
    },
    'Shipping': {
      color: '#6625F1',
      background: '#F1EBFE',
      borderRadius: '10px',
      padding: '6px 12px',
      display: 'inline-block'
    },
    'Complaint': {
      color: '#FF1E00',
      background: '#F9EDEB',
      borderRadius: '10px',
      padding: '6px 12px',
      display: 'inline-block'
    },
    'Canceled': {
      color: '#808080',
      background: '#E5E7E5',
      borderRadius: '10px',
      padding: '6px 12px',
      display: 'inline-block'
    },
    'Done': {
      color: '#0C809A',
      background: '#E1F3F7',
      borderRadius: '10px',
      padding: '6px 12px',
      display: 'inline-block'
    }
  };

  return (
    <div className="container mt-4">
      <div className="searches row align-items-center gx-3 mt-3 mb-3">
        {/* Search Input - Updated */}
        <div className="col-8 col-md-8">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Add Product Button */}
        <div className="col-4 col-md-4">
          <button
            id="addProductBtn"
            className="btn p-3 p-md-3 d-flex align-items-center justify-content-center"
          >
            <i className="bi bi-plus-circle me-2"></i>
            <span className="d-none d-sm-inline">Add Product</span>
            <span className="d-inline d-sm-none">Add</span>
          </button>
        </div>
      </div>

      {/* Order Tabs */}
      <div className="mb-4">
        <ul className="nav nav-tabs">
          {['All Orders', 'Received', 'Shipping', 'Complaint', 'Canceled', 'Done'].map((filter) => (
            <li className="nav-item" key={filter}>
              <button
                className={`nav-link ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => handleFilterChange(filter)}
              >
                {filter}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Customer Name</th>
              <th className="py-3 px-4">Order Date</th>
              <th className="py-3 px-4">Total Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length > 0 ? (
              currentOrders.map((order, index) => (
                <tr key={order.oid}>
                  <td className="py-3 px-4">{index + 1 + indexOfFirstOrder}</td>
                  <td className="py-3 px-4">{order.order_id}</td>
                  <td className="py-3 px-4">{order.user.username}</td>
                  <td className="py-3 px-4">{order.order_date}</td>
                  <td className="py-3 px-4">{order.total_amount}</td>
                  <td className="py-3 px-4">
                    <span style={statusStyles[order.status] || {}}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {order.status === 'Received' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleShipmentClick(order.oid)}
                      >
                        Create Shipments
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  {searchTerm ? 'No matching orders found' : 'No orders found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <span>
          Showing {currentOrders.length} of {filteredAndSearchedOrders.length} entries
        </span>
        <Pagination>
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <MdChevronLeft />
          </Pagination.Prev>
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index}
              active={currentPage === index + 1}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <MdChevronRight />
          </Pagination.Next>
        </Pagination>
      </div>

      {showShipmentDetails && selectedOrderOid && (
        <ShipmentsDetails
          oid={selectedOrderOid} 
          onClose={() => setShowShipmentDetails(false)}
        />
      )}
    </div>
  );
};

export default OrderSummary;