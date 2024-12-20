import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PencilLine } from "lucide-react";
import compressor from "../User/Assets/compressor-img.png";
import baseurl from "../ApiService/ApiService";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import Swal from "sweetalert2";

const DistributorsViewDetails = () => {
  const { id } = useParams();
  const [distributor, setDistributor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDistributorDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${baseurl}/api/getDistributorById/${id}`
      );
      setDistributor(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching distributor details:", error);
      setError("Failed to load distributor details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributorDetails();
  }, [id]);

  const handleEditCreditLimit = async () => {
    const currentLimit = parseFloat(distributor?.current_credit_limit) || 0;
    
    const { value: formValues } = await Swal.fire({
      title: 'Edit Current Credit Limit',
      html: `
        <div class="mb-3">
          <label class="form-label">Current Credit Limit</label>
          <input 
            id="swal-current-limit" 
            class="form-control" 
            value="${currentLimit.toFixed(2)}"
            readonly
          >
        </div>
        <div class="mb-3">
          <label class="form-label">Add Amount</label>
          <input 
            id="swal-add-amount" 
            class="form-control" 
            type="number"
            min="0"
            step="0.01"
            required
          >
        </div>
        <div class="mb-3">
          <label class="form-label">Updated Current Credit Limit</label>
          <input 
            id="swal-new-total" 
            class="form-control" 
            readonly
          >
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      didOpen: () => {
        // Add event listener to calculate total when amount is entered
        const addAmountInput = document.getElementById('swal-add-amount');
        const newTotalInput = document.getElementById('swal-new-total');
        
        addAmountInput.addEventListener('input', () => {
          const addAmount = parseFloat(addAmountInput.value) || 0;
          const newTotal = currentLimit + addAmount;
          // Ensure newTotal is a number before using toFixed
          newTotalInput.value = Number(newTotal).toFixed(2);
        });
      },
      preConfirm: () => {
        const addAmount = parseFloat(document.getElementById('swal-add-amount').value) || 0;
        if (addAmount <= 0) {
          Swal.showValidationMessage('Please enter a valid amount');
          return false;
        }
        const newTotal = currentLimit + addAmount;
        return Number(newTotal).toFixed(2);
      }
    });
  
    if (formValues) {
      try {
        const response = await axios.put(
          `${baseurl}/api/updateDistributorCreditLimit/${id}`,
          {
            current_credit_limit: parseFloat(formValues)
          }
        );
        
        if (response.data) {
          await Swal.fire({
            title: 'Success!',
            text: 'Credit limit updated successfully',
            icon: 'success',
            timer: 1500
          });
          await fetchDistributorDetails();
        }
      } catch (error) {
        console.error("Error updating credit limit:", error);
        await Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to update credit limit',
          icon: 'error'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-danger text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Image Section */}
        <div className="col-md-12">
          <div className="w-100">
            {distributor?.image ? (
              <img
                src={`${baseurl}/${distributor.image[0]?.image_path}`}
                alt="Distributor"
                className="img-fluid rounded distributor-img"
                onError={(e) => {
                  e.target.src = compressor;
                }}
              />
            ) : (
              <img
                src={compressor}
                alt="Default"
                className="img-fluid rounded"
              />
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="col-md-12 mt-4">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Distributor Details</h4>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <strong>Company Name:</strong> {distributor?.companyname || "N/A"}
                  </p>
                  <p>
                    <strong>Location:</strong> {distributor?.location || "N/A"}
                  </p>
                  <p>
                    <strong>GST Number:</strong> {distributor?.gstnumber || "N/A"}
                  </p>
                  <p>
                    <strong>Credit Limit:</strong> {distributor?.creditlimit || "N/A"}
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Name:</strong> {distributor?.contact_person_name || "N/A"}
                  </p>
                  <p>
                    <strong>Phone Number:</strong> {distributor?.phoneno || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {distributor?.email || "N/A"}
                  </p>
                  <p className="d-flex align-items-center gap-2">
                    <strong>Current Credit Limit:</strong> {" "}
                    {distributor?.current_credit_limit || "N/A"}
                    <button
                      className="btn p-1"
                      style={{ marginLeft: "2%", background: "#f1f1f1", color: "#0024FF" }}
                      onClick={handleEditCreditLimit}
                    >
                      <PencilLine size={20} />
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributorsViewDetails;
