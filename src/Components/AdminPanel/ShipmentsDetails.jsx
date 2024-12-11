import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseurl from '../ApiService/ApiService';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { use } from 'react';

const ShipmentsDetails = ({ isEditMode = false, initialShipmentData = null, onClose, }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transportOptions, setTransportOptions] = useState([]);

  const [formData, setFormData] = useState({
    sid: '',
    orderId: '',
    productIds: [],
    distributorName: '',
    quantities: [],
    prices: [],
    productNames: [],
    dispatchDate: '',
    dispatchAddress: '',
    transport: '',
    status: 'Shipment',
  });

  useEffect(() => {
    if (isEditMode && initialShipmentData) {
      const formattedDate = initialShipmentData.dispatch_date
        ? new Date(initialShipmentData.dispatch_date).toISOString().split('T')[0]
        : '';

      setFormData({
        sid: initialShipmentData.sid || '',
        orderId: initialShipmentData.order_id || '',
        productIds: initialShipmentData.shipment_items
          ? initialShipmentData.shipment_items.map((item) => item.product_id)
          : [],
        productNames: initialShipmentData.shipment_items
          ? initialShipmentData.shipment_items.map((item) => item.product_name)
          : [],
        distributorName: initialShipmentData.distributor_name || '',
        quantities: initialShipmentData.shipment_items
          ? initialShipmentData.shipment_items.map((item) => item.quantity)
          : [],
        prices: initialShipmentData.shipment_items
          ? initialShipmentData.shipment_items.map((item) => item.price)
          : [],
        dispatchDate: formattedDate,
        dispatchAddress: initialShipmentData.dispatch_address || '',
        transport: initialShipmentData.transport || '',
        status: initialShipmentData.status || 'Shipment',
      });
    } else if (!isEditMode && id) {
      fetchOrderDetails();
    }
  }, [isEditMode, initialShipmentData, id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/order/${id}`);
      const order = response.data.data;

      const productIds = order.OrderItems.map((item) => item.product_id);
      const quantities = order.OrderItems.map((item) => item.quantity);
      const prices = order.OrderItems.map((item) => item.price);
      const productNames = order.OrderItems.map((item) => item.Product.product_name);

      setFormData((prevState) => ({
        ...prevState,
        orderId: order.order_id,
        productIds,
        quantities,
        prices,
        productNames,
        transport: order.transport.travels_name
      }));
    } catch (error) {
      console.error('Error fetching order details:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch order details',
        confirmButtonColor: '#d33',
      });
    }
  };

  const fetchTransportData = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/transport`);
      setTransportOptions(response.data); // Set the transport options
    } catch (error) {
      console.error('Error fetching transport data:', error);
    }
  };
  useEffect(() => {
    fetchTransportData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    navigate('/AdminDashboard/OrderSummary');
  };

  // Modified to only allow changes to product names
  const handleItemChange = (index, field, value) => {
    if (field === 'productNames') {
      setFormData((prevState) => {
        const newState = { ...prevState };
        newState[field] = [...prevState[field]];
        newState[field][index] = value;
        return newState;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const shipmentData = {
        order_id: formData.orderId,
        product_id: formData.productIds,
        product_names: formData.productNames,
        distributor_name: formData.distributorName,
        quantity: formData.quantities,
        prices: formData.prices,
        dispatch_date: formData.dispatchDate,
        dispatch_address: formData.dispatchAddress,
        transport: formData.transport,
        status: formData.status,
      };

      let response;
      if (isEditMode) {
        response = await axios.put(`${baseurl}/api/updateShipment/${formData.sid}`, shipmentData);

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Shipment updated successfully!',
          confirmButtonColor: '#3085d6',
        }).then(() => {
          if (onClose) onClose();
        });
      } else {
        response = await axios.post(`${baseurl}/api/shipments`, shipmentData);

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Shipment created successfully!',
          confirmButtonColor: '#3085d6',
        }).then(() => {
          if (onClose) {
            onClose();
          } else {
            navigate('/AdminDashboard/Shipments');
          }
        });
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} shipment:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to ${isEditMode ? 'update' : 'create'} shipment`,
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className="card border-0">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="orderId" className="form-label">Order ID</label>
              <input
                type="text"
                className="form-control"
                id="orderId"
                name="orderId"
                value={formData.orderId}
                onChange={handleChange}
                disabled={!isEditMode}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="distributorName" className="form-label">Distributor Name</label>
              <input
                type="text"
                className="form-control"
                id="distributorName"
                name="distributorName"
                value={formData.distributorName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Shipment Items */}
          <div className="mb-3">
            <label className="form-label">Shipment Items</label>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Product ID</th>
                    <th>Quantity</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.productIds.map((productId, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.productNames[index] || ''}
                          onChange={(e) => handleItemChange(index, 'productNames', e.target.value)}
                          readOnly={!isEditMode}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={productId}
                          readOnly
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.quantities[index] || ''}
                          readOnly
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.prices[index] || ''}
                          readOnly
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="dispatchDate" className="form-label">Dispatch Date</label>
              <input
                type="date"
                className="form-control"
                id="dispatchDate"
                name="dispatchDate"
                value={formData.dispatchDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="status" className="form-label">Status</label>
              <select
                className="form-select"
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Shipment">Shipment</option>
                <option value="Delivered">Delivered</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="dispatchAddress" className="form-label">Dispatch Address</label>
              <textarea
                className="form-control"
                id="dispatchAddress"
                name="dispatchAddress"
                value={formData.dispatchAddress}
                onChange={handleChange}
                required
                rows="3"
              ></textarea>
            </div>
            <div className="col-md-6">
              <label htmlFor="transport" className="form-label">Transport</label>
              <select
                className="form-select"
                id="transport"
                name="transport"
                value={formData.transport}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select Transport</option>
                {transportOptions.map((transport) => (
                  <option key={transport.id} value={transport.travels_name}>
                    {transport.travels_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-end">
            <button type="button" className="btn btn-secondary me-2" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn" style={{ background: '#F24E1E', color: 'white' }}>
              {isEditMode ? 'Update' : 'Create'} Shipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShipmentsDetails;