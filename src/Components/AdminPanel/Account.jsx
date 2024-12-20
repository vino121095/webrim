import React, { useState, useRef, useEffect } from 'react';
import userLogo from "../User/Assets/user-logo.png";
import './AdminPanel.css';
import axios from 'axios';
import baseurl from '../ApiService/ApiService';
import Swal from 'sweetalert2';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    aboutStore: '',
    storeAddress: ''
  });
  
  const [profileImage, setProfileImage] = useState(userLogo);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.aid) {
          throw new Error('Admin ID not found in localStorage');
        }

        const response = await axios.get(`${baseurl}/api/admin/${userData.aid}`);
        const data = response.data.admin;

        // Update form data
        setFormData({
          name: data.name || '',
          phoneNumber: data.phoneNumber || '',
          email: data.email || '',
          aboutStore: data.aboutStore || '',
          storeAddress: data.storeAddress || ''
        });

        // Update profile image if exists
        if (data.profileimagepath) {
          setProfileImage(data.profileimagepath);
        }

        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to fetch profile data',
          confirmButtonColor: '#3085d6'
        });
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfileData();
  }, []);

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
      // Store the file for binary upload
      setSelectedFile(file);

      // Create a preview
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
    Swal.fire({
      title: 'Remove Profile Picture?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setProfileImage(userLogo);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.aid) {
        throw new Error('Admin ID not found in localStorage');
      }

      // Create FormData for binary upload
      const formDataToSend = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Append image file if selected
      if (selectedFile) {
        formDataToSend.append('profileImage', selectedFile);
      }

      // Send update to backend with binary data
      const response = await axios.put(`${baseurl}/api/admin/${userData.aid}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'Your profile has been updated successfully!',
        confirmButtonColor: '#3085d6'
      });
      
      setIsLoading(false);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.response?.data?.message || 'Failed to update profile. Please try again.',
        confirmButtonColor: '#3085d6'
      });
      console.error('Error updating profile:', err);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-profile-container container">
      <div className="profile-header d-flex justify-content-between align-items-center mb-4">
        <h1 className="profile-title">Edit Profile</h1>
      </div>

      <div className="image-section d-flex align-items-center gap-3 mb-4">
        <img 
          src={ profileImage.startsWith('http://') || profileImage.startsWith('https://') || profileImage.startsWith('data:') 
            ? profileImage 
            : `${baseurl}/${profileImage}`}
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

      {/* Rest of the form remains the same */}
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
            disabled
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
        <button 
          type="submit" 
          className="btn btn-success mt-3"
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;