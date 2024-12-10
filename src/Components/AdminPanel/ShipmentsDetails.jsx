
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseurl from '../ApiService/ApiService';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ShipmentsDetails = ({ isEditMode = false, initialShipmentData = null, onClose }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    sid: '',
    orderId: '',
    productIds: [],
    distributorName: '',
    quantities: [],
    price: '',
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
        distributorName: initialShipmentData.distributor_name || '',
        quantities: initialShipmentData.shipment_items
          ? initialShipmentData.shipment_items.map((item) => item.quantity)
          : [],
        price: initialShipmentData.total_price || '',
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

      const totalPrice = order.OrderItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      setFormData((prevState) => ({
        ...prevState,
        orderId: order.order_id,
        productIds,
        quantities,
        price: totalPrice.toFixed(2),
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const shipmentData = {
        order_id: formData.orderId,
        product_id: formData.productIds,
        distributor_name: formData.distributorName,
        quantity: formData.quantities,
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

        const shipment = response.data.shipment;

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Shipment created successfully!',
          confirmButtonColor: '#3085d6',
        }).then(() => {
          if (onClose) {
            onClose();
          } else {
            navigate(`/AdminDashboard/ShipmentConfirmForm/${shipment.sid}`);
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
                readOnly
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="productIds" className="form-label">Product ID(s)</label>
              <input
                type="text"
                className="form-control"
                id="productIds"
                name="productIds"
                value={formData.productIds.join(', ')}
                readOnly
              />
            </div>
          </div>
          <div className="row mb-3">
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
            <div className="col-md-6">
              <label htmlFor="quantities" className="form-label">Quantity</label>
              <input
                type="text"
                className="form-control"
                id="quantities"
                name="quantities"
                value={formData.quantities.join(', ')}
                readOnly
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="price" className="form-label">Total Price</label>
              <input
                type="text"
                className="form-control"
                id="price"
                name="price"
                value={formData.price}
                readOnly
              />
            </div>
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
              ></textarea>
            </div>
            <div className="col-md-6">
              <label htmlFor="transport" className="form-label">Transport</label>
              <input
                type="text"
                className="form-control"
                id="transport"
                name="transport"
                value={formData.transport}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="text-end">
            <button type="submit" className="btn btn-primary">
              {isEditMode ? 'Update' : 'Create'} Shipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShipmentsDetails;