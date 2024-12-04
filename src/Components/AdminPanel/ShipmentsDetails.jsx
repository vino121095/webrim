import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseurl from '../ApiService/ApiService';
import { useParams, useNavigate } from 'react-router-dom';

const ShipmentsDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const oid = id;

  const [formData, setFormData] = useState({
    orderId: '',
    productIds: [],
    distributorName: '',
    quantities: [],
    price: '',
    dispatchDate: '',
    dispatchAddress: '',
    transport: '',
  });

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/order/${oid}`);
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
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [oid]);

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
      };

      const response = await axios.post(`${baseurl}/api/shipments`, shipmentData);
      const shipment = response.data.shipment;
      console.log('Shipment created successfully:', shipment);
      const sid = shipment.sid;
      alert('Shipment created successfully!');
      navigate(`/AdminDashboard/ShipmentConfirmForm/${sid}`); 
    } catch (error) {
      console.error('Error creating shipment:', error);
      alert('Failed to create shipment');
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Shipment Details</h4>
      </div>
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
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="dispatchAddress" className="form-label">Dispatch Address</label>
              <textarea
                className="form-control"
                id="dispatchAddress"
                name="dispatchAddress"
                value={formData.dispatchAddress}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="transport" className="form-label">Transport</label>
            <input
              type="text"
              className="form-control"
              id="transport"
              name="transport"
              value={formData.transport}
              onChange={handleChange}
            />
          </div>

          <div className="text-end">
            <button type="submit" className="btn btn-primary">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShipmentsDetails;
