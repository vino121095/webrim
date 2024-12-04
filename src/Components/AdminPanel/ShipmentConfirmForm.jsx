import React, { useState, useEffect } from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import baseurl from '../ApiService/ApiService'; 

const ShipmentConfirmForm = () => {
  const [shipmentData, setShipmentData] = useState({
    orderId: '',
    shipmentId: '',
    distributorName: '',
    totalQuantity: '',
    totalPrice: '',
    dispatchDate: '',
    dispatchAddress: '',
    transport: '',
    status: '',
    shipmentItems: []
  });

  const id = useParams();
  console.log(id);
  const shipment_id = parseInt(id.id);

  useEffect(() => {
    fetchShipmentDetails();
  }, []);

  const fetchShipmentDetails = async () => {
    try { 
      const response = await axios.get(`${baseurl}/api/getShipment/${shipment_id}`);
      const data = response.data.data; 
      setShipmentData({
        orderId: data.order_id || 'null',
        shipmentId: data.shipment_id,
        distributorName: data.distributor_name,
        totalQuantity: data.total_quantity,
        totalPrice: data.total_price,
        dispatchDate: data.dispatch_date,
        dispatchAddress: data.dispatch_address,
        transport: data.transport,
        status: data.status,
        shipmentItems: data.shipment_items
      });
    } catch (error) {
      console.error('Error fetching shipment details:', error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Shipment Confirmation</h2>

              <form>
                {/* Existing form fields */}
                <div className="row mb-3 align-items-center">
                  <div className="col-md-4">
                    <label htmlFor="orderId" className="form-label fw-medium">Order ID</label>
                  </div>
                  <div className="d-none d-md-block col-md-1 text-center">:</div>
                  <div className="col-md-7">
                    <input
                      type="text"
                      className="form-control"
                      id="orderId"
                      name="orderId"
                      value={shipmentData.orderId}
                      readOnly
                    />
                  </div>
                </div>
                <div className="row mb-3 align-items-center">
                  <div className="col-md-4">
                    <label htmlFor="shipmentId" className="form-label fw-medium">Shipment ID</label>
                  </div>
                  <div className="d-none d-md-block col-md-1 text-center">:</div>
                  <div className="col-md-7">
                    <input
                      type="text"
                      className="form-control"
                      id="shipmentId"
                      name="shipmentId"
                      value={shipmentData.shipmentId}
                      readOnly
                    />
                  </div>
                </div>
                <div className="row mb-3 align-items-center">
                  <div className="col-md-4">
                    <label htmlFor="distributorName" className="form-label fw-medium">Distributor Name</label>
                  </div>
                  <div className="d-none d-md-block col-md-1 text-center">:</div>
                  <div className="col-md-7">
                    <input
                      type="text"
                      className="form-control"
                      id="distributorName"
                      name="distributorName"
                      value={shipmentData.distributorName}
                      readOnly
                    />
                  </div>
                </div>
                
                {/* New fields */}
                <div className="row mb-3 align-items-center">
                  <div className="col-md-4">
                    <label htmlFor="totalQuantity" className="form-label fw-medium">Total Quantity</label>
                  </div>
                  <div className="d-none d-md-block col-md-1 text-center">:</div>
                  <div className="col-md-7">
                    <input
                      type="text"
                      className="form-control"
                      id="totalQuantity"
                      name="totalQuantity"
                      value={shipmentData.totalQuantity}
                      readOnly
                    />
                  </div>
                </div>
                <div className="row mb-3 align-items-center">
                  <div className="col-md-4">
                    <label htmlFor="totalPrice" className="form-label fw-medium">Total Price</label>
                  </div>
                  <div className="d-none d-md-block col-md-1 text-center">:</div>
                  <div className="col-md-7">
                    <input
                      type="text"
                      className="form-control"
                      id="totalPrice"
                      name="totalPrice"
                      value={shipmentData.totalPrice}
                      readOnly
                    />
                  </div>
                </div>
                <div className="row mb-3 align-items-center">
                  <div className="col-md-4">
                    <label htmlFor="status" className="form-label fw-medium">Status</label>
                  </div>
                  <div className="d-none d-md-block col-md-1 text-center">:</div>
                  <div className="col-md-7">
                    <input
                      type="text"
                      className="form-control"
                      id="status"
                      name="status"
                      value={shipmentData.status}
                      readOnly
                    />
                  </div>
                </div>

                {/* Existing fields continue */}
                <div className="row mb-3 align-items-center">
                  <div className="col-md-4">
                    <label htmlFor="dispatchDate" className="form-label fw-medium">Dispatch Date</label>
                  </div>
                  <div className="d-none d-md-block col-md-1 text-center">:</div>
                  <div className="col-md-7">
                    <input
                      type="text"
                      className="form-control"
                      id="dispatchDate"
                      name="dispatchDate"
                      value={shipmentData.dispatchDate}
                      readOnly
                    />
                  </div>
                </div>
                <div className="row mb-3 align-items-center">
                  <div className="col-md-4">
                    <label htmlFor="dispatchAddress" className="form-label fw-medium">Dispatch Address</label>
                  </div>
                  <div className="d-none d-md-block col-md-1 text-center">:</div>
                  <div className="col-md-7">
                    <input
                      type="text"
                      className="form-control"
                      id="dispatchAddress"
                      name="dispatchAddress"
                      value={shipmentData.dispatchAddress}
                      readOnly
                    />
                  </div>
                </div>
                <div className="row mb-3 align-items-center">
                  <div className="col-md-4">
                    <label htmlFor="transport" className="form-label fw-medium">Transport</label>
                  </div>
                  <div className="d-none d-md-block col-md-1 text-center">:</div>
                  <div className="col-md-7">
                    <input
                      type="text"
                      className="form-control"
                      id="transport"
                      name="transport"
                      value={shipmentData.transport}
                      readOnly
                    />
                  </div>
                </div>

                {/* Shipment Items Section */}
                <div className="row mb-3">
                  <div className="col-12">
                    <h4 className="mb-3">Shipment Items</h4>
                    <div className="table-responsive">
                    <table className="table table-striped shipment-table">
                      <thead>
                        <tr>
                          <th>Product ID</th>
                          <th>Product Name</th>
                          <th>Quantity</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipmentData.shipmentItems.map((item, index) => (
                          <tr key={index}>
                            <td>{item.product_id}</td>
                            <td>{item.product_name}</td>
                            <td>{item.quantity}</td>
                            <td>{item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentConfirmForm;