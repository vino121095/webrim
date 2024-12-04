import React, { useState, useRef } from 'react';
import userLogo from "../User/Assets/user-logo.png";
import './AdminPanel.css';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    aboutStore: '',
    storeAddress: ''
  });
  
  const [profileImage, setProfileImage] = useState(userLogo);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveImage = () => {
    setProfileImage(userLogo);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Form submitted:', {
      ...formData,
      profileImage
    });
  };

  return (
    <div className="edit-profile-container container">
      <div className="profile-header d-flex justify-content-between align-items-center mb-4">
        <h1 className="profile-title">Edit Profile</h1>
      </div>

      <div className="image-section d-flex align-items-center gap-3 mb-4">
        <img 
          src={profileImage}
          alt="Profile" 
          className="profile-image"
        />
        <div className="profile-actions d-flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="d-none"
          />
          <button 
            type="button"
            className="btn"
            style={{color: 'black', border: '1px solid black'}}
            onClick={handleUploadClick}
          >
            Edit profile
          </button>
          <button 
            type="button"
            className="btn"
            style={{color: 'red'}}
            onClick={handleRemoveImage}
          >
            Remove
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-control custom-input"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className="form-control custom-input"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">E-mail</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-control custom-input"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">About Store</label>
          <input
            type="text"
            name="aboutStore"
            value={formData.aboutStore}
            onChange={handleInputChange}
            className="form-control custom-input"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Store Address</label>
          <input
            type="text"
            name="storeAddress"
            value={formData.storeAddress}
            onChange={handleInputChange}
            className="form-control custom-input"
          />
        </div>

        <button type="submit" className="btn btn-success mt-3">
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default EditProfile;