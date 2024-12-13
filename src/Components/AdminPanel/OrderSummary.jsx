import React, { useState, useEffect } from 'react';
import { Pagination, Modal, Button } from 'react-bootstrap';
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
  const [selectedOrder, setSelectedOrder] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/orders`);
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };
  useEffect(() => {
       fetchOrders();
  }, []);

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`${baseurl}/api/order/${orderId}`);
      setOrderDetails(response.data.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };
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

  const [show, setShow] = useState(false);

  // Option 1: Simple close function
  const handleClose = () => {
    setShow(false);
  };

  // Option 2: Open modal function
  const handleShow = () => {
    setShow(true);
  };

  const handleDetailsModalClose = () => {
    setShowDetailsModal(false);
    setOrderDetails(null);
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
    'Cancelled': {
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
  const handleChangeStatus = (order)=>{
    setSelectedOrder(order);
    handleShow();
  }

  const handleCancel = async()=>{
    try {
      const response = await axios.put(`${baseurl}/api/cancelOrder/${selectedOrder.oid}`);
      setOrders(response.data.data || []);
      fetchOrders();
      setShow(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }
  const handleComplete = async()=>{
    try {
      const response = await axios.put(`${baseurl}/api/completeOrder/${selectedOrder.oid}`);
      setOrders(response.data.data || []);
      fetchOrders();
      setShow(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }

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
          {['All Orders', 'Received', 'Shipping', 'Complaint', 'Cancelled', 'Done'].map((filter) => (
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
                  <td className="py-3 px-4" style={{cursor:'pointer'}}>
                    <span style={statusStyles[order.status] || {}} onClick={()=>handleChangeStatus(order)}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {/* {order.status === 'Received' && ( */}
                      <button 
                      className='btn btn-primary btn-sm'
                      onClick={() => fetchOrderDetails(order.oid)}
                    >
                      View Order
                    </button>
                    {/* )} */}
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
                  key={index}
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

      {showShipmentDetails && selectedOrderOid && (
        <ShipmentsDetails
          oid={selectedOrderOid} 
          onClose={() => setShowShipmentDetails(false)}
        />
      )}

       <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Order #{selectedOrder.order_id} Actions</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className="mb-3">
          <strong>Current Status:</strong><span> </span>
          <span 
            className="ml-2" 
            style={statusStyles[selectedOrder.status] || {}}
          >
            {selectedOrder.status}
          </span>
        </div>

        {selectedOrder.status === "Shipping" && (
          <div className='d-flex justify-content-around'><Button 
          variant="danger" onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button 
            variant="success" onClick={handleComplete}
          >
            Done
          </Button>
        </div>
         
        )}
         {selectedOrder.status === "Received" && (
          <div className='d-flex justify-content-around'><Button 
          variant="danger" onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button 
            variant="primary" onClick={() => handleShipmentClick(selectedOrder.oid)}
          >
            Create Shipment
          </Button>
        </div>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>

    {/* Order Details Modal */}
    <Modal show={showDetailsModal} onHide={handleDetailsModalClose} centered size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Order Details #{orderDetails?.order_id}</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    {orderDetails ? (
      <div>
        {/* User Information */}
        <div className="mb-4">
          <h5>User Information</h5>
          <div>
            <p><strong>User ID:</strong> {orderDetails.user?.uid}</p>
            <p><strong>Name:</strong> {orderDetails.user?.username}</p>
            <p><strong>Email:</strong> {orderDetails.user?.email}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-4">
          <h5>Order Items</h5>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.OrderItems?.map((item) => (
                  <tr key={item.oitems_id}>
                    <td>{item.Product.product_name}</td>
                    <td>{item.quantity}</td>
                    <td><i className="bi bi-currency-rupee"></i>{item.price}</td>
                    <td><i className="bi bi-currency-rupee"></i>{(item.quantity * item.price).toFixed(2)}</td>
                    <td>{orderDetails.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Amount */}
        <div className="text-end">
          <h5>
            Total Amount: <i className="bi bi-currency-rupee"></i>{orderDetails.total_amount}
          </h5>
        </div>
      </div>
    ) : (
      <div className="text-center">Loading order details...</div>
    )}
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={handleDetailsModalClose}>
      Close
    </Button>
  </Modal.Footer>
</Modal>

    </div>
  );
};

export default OrderSummary;