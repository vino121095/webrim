import React from 'react';
import NavBar from './NavBar';
import baseurl from '../ApiService/ApiService'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfileInfo = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userData'));

  // State to manage form inputs
  const [formData, setFormData] = useState({
    full_name: user?.username || '',
    mobile_number: '',
    email: user?.email || '',
    company_name: '',
    credit_limit: '',
    address: '',
    pincode: '',
    landmark: '',
    city: '',
    state: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!user) {
          navigate("/Auth/Login"); // Redirect if user is not logged in
          return;
        }
  
        const response = await axios.get(`${baseurl}/api/userprofile/${user.uid}`);
        const profileData = response.data.data;
  
        setFormData(prevState => ({
          ...prevState,
          full_name: profileData.full_name || user.username,
          mobile_number: profileData.mobile_number || '',
          email: profileData.email || user.email,
          company_name: profileData.company_name || '',
          credit_limit: profileData.credit_limit || '',
          address: profileData.address || '',
          pincode: profileData.pincode || '',
          landmark: profileData.landmark || '',
          city: profileData.city || '',
          state: profileData.state || ''
        }));
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
  
    fetchUserProfile();
  }, []); 
  

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Convert credit_limit to a number
      const submitData = {
        ...formData,
        credit_limit: parseFloat(formData.credit_limit)
      };

      // Make API call
      const response = await axios.put(`${baseurl}/api/user/${user.uid}`, submitData);
      
      // Handle successful response
      alert('Profile updated successfully!');
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };
  const customStyle = {
    backgroundColor: '#F8F8F8',
    border: 'none',
    borderRadius: '5px',
    padding: '10px',
  };

  const labelStyle = {
    fontWeight: 'bold',
  };

  const profileUpdateBtn = {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    fontSize: '15px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: 'none',
    marginTop: '20px',
  };

  return (
    <>
    <NavBar />
    <div className="container mt-5 mb-3">
        <h3 className="mb-4">Personal Information</h3>
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="full_name" className="form-label" style={labelStyle}>
                Full Name
              </label>
              <input
                type="text"
                className="form-control"
                id="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                style={customStyle}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="mobile_number" className="form-label" style={labelStyle}>
                Mobile Number
              </label>
              <input
                type="text"
                className="form-control"
                id="mobile_number"
                value={formData.mobile_number}
                onChange={handleInputChange}
                style={customStyle}
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label" style={labelStyle}>
              E-Mail Address
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              style={customStyle}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="company_name" className="form-label" style={labelStyle}>
              Company Name
            </label>
            <input
              type="text"
              className="form-control"
              id="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              style={customStyle}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="credit_limit" className="form-label" style={labelStyle}>
              Credit Limit
            </label>
            <input
              type="number"
              className="form-control"
              id="credit_limit"
              value={formData.credit_limit}
              onChange={handleInputChange}
              style={customStyle}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="address" className="form-label" style={labelStyle}>
              Address
            </label>
            <textarea
              className="form-control"
              id="address"
              rows="3"
              value={formData.address}
              onChange={handleInputChange}
              style={customStyle}
            ></textarea>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="pincode" className="form-label" style={labelStyle}>
                Pincode
              </label>
              <input
                type="text"
                className="form-control"
                id="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                style={customStyle}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="landmark" className="form-label" style={labelStyle}>
                Landmark
              </label>
              <input
                type="text"
                className="form-control"
                id="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                style={customStyle}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="city" className="form-label" style={labelStyle}>
                City
              </label>
              <input
                type="text"
                className="form-control"
                id="city"
                value={formData.city}
                onChange={handleInputChange}
                style={customStyle}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="state" className="form-label" style={labelStyle}>
                State
              </label>
              <input
                type="text"
                className="form-control"
                id="state"
                value={formData.state}
                onChange={handleInputChange}
                style={customStyle}
              />
            </div>
          </div>

          <button type="submit" className="btn" style={profileUpdateBtn}>
            Update
          </button>
        </form>
      </div>
    </>
    
  );
};

export default ProfileInfo;
