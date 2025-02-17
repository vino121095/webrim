import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import defaultImage from "../User/Assets/compressor-img.png";
import baseurl from "../ApiService/ApiService";
import NavBar from "./NavBar";
import Swal from "sweetalert2";

const DistributorProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(defaultImage);
  const [quantity, setQuantity] = useState('1');
  const LoggedUser = JSON.parse(localStorage.getItem('userData'));
  const [formData, setFormData] = useState({
    distributor_name: LoggedUser?.username || "",
    phone_number: LoggedUser?.mobile_number || ""
  });

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`${baseurl}/api/productDetail/${id}`);
        const fetchedProduct = response.data;

        if (fetchedProduct.images && Array.isArray(fetchedProduct.images)) {
          fetchedProduct.images = fetchedProduct.images.map(
            (img) => img.image_path
          );
          setMainImage(`${baseurl}/${fetchedProduct.images[0]}`);
        }

        setProduct(fetchedProduct);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleQuantityChange = (value) => {
    // Allow empty value for typing
    if (value === '') {
      setQuantity('');
      return;
    }

    const newQuantity = parseInt(value);
    
    // Validate the input
    if (isNaN(newQuantity) || newQuantity < 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Quantity',
        text: 'Please enter a valid quantity (0 or greater)',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    setQuantity(value);
  };

  const handleAddToCartClick = async (product) => {
    // Validate quantity before adding to cart
    if (quantity === '' || parseInt(quantity) === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Quantity',
        text: 'Please enter a valid quantity before adding to cart',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    try {
      const cartResponse = await axios.post(`${baseurl}/api/addtocart`, {
        user_id: LoggedUser.uid,
        product_id: product.product_id,
        product_name: product.product_name,
        quantity: parseInt(quantity),
        distributor_name: formData.distributor_name,
        phone_number: formData.phone_number,
      });

      if (cartResponse.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: "Product added to cart successfully!",
          confirmButtonText: 'Go to Cart',
          cancelButtonText: 'Continue Shopping',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/User/Cart');
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: "Submission failed. Please try again.",
          confirmButtonText: 'Retry',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error("Submission Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Failed to submit. Please check your network or contact support.",
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33'
      });
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <NavBar />
      <ul className="breadcrumb" style={{
        padding: "10px 16px",
        listStyle: "none",
        backgroundColor: "#f8f9fa",
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "5px",
        margin: "0",
      }}>
        <li style={{ fontSize: "18px", margin: "0" }}>
          <a href="/" style={{ textDecoration: "none", color: "#007bff", fontWeight: "bold" }}>
            Home
          </a>
        </li>
        <li style={{ fontSize: "18px", margin: "0" }}>/</li>
        <li style={{ fontSize: "17px", margin: "0", color: "#6c757d", cursor: "not-allowed" }}>
          Product View
        </li>
      </ul>

      <div className="container product-details-container my-4">
        <div className="row">
          {/* Image Section */}
          <div className="col-lg-6 mb-4 h-75">
            <div className="productImageSection bg-white w-100">
              <div className="text-center pt-4 d-flex justify-content-center" style={{ height: '500px' }}>
                <img
                  src={mainImage}
                  alt="Main Product"
                  className="mainImage img-fluid rounded border"
                  style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                />
              </div>
              <div className="thumbnailGallery d-flex justify-content-evenly flex-wrap mt-3 pb-4">
                {product.images && product.images.length > 0 ? (
                  product.images.map((img, index) => (
                    <img
                      key={index}
                      src={`${baseurl}/${img}`}
                      alt={`Thumbnail ${index + 1}`}
                      className="thumbnail img-fluid border rounded me-2 p-2 border"
                      onClick={() => setMainImage(`${baseurl}/${img}`)}
                    />
                  ))
                ) : (
                  <img
                    src={defaultImage}
                    alt="Default Thumbnail"
                    className="thumbnail img-fluid border rounded"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="col-lg-6">
            <div className="productInfoSection p-3 rounded shadow-sm bg-white d-flex justify-content-between flex-column">
              <div>
                <div className="d-flex justify-content-between">
                  <h4 className="productName">{product.product_name}</h4>
                  <h3 className="productPrice text-primary">
                    <i className="bi bi-currency-rupee"></i> {product.distributors_rate}
                  </h3>
                </div>
                <p>
                  <strong>ID Product:</strong> {product.product_id}
                </p>
                
                {/* Quantity Input and Add to Cart */}
                <div className="d-flex flex-column flex-sm-row align-items-start justify-content-lg-center gap-2 py-2">
                  <div className="input-group" style={{ width: 'auto' }}>
                    <input
                      type="number"
                      className="form-control"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      min="0"
                      style={{ width: '80px', textAlign: 'center' }}
                      placeholder="0"
                    />
                  </div>

                  <button
                    className="btn add-to-card-button d-flex align-items-center justify-content-center"
                    style={{ minWidth: '150px',marginTop:'5px' }}
                    onClick={() => handleAddToCartClick(product)}
                  >
                    <i className="bi bi-cart-plus me-2"></i>
                    Add to Cart
                  </button>
                </div>

                <div className="aboutProduct mb-3 mt-4">
                  <h4 style={{ fontWeight: "700" }}>About Product</h4>
                  <p style={{ textIndent: "3em", textAlign: "justify" }}>{product.product_description}</p>
                </div>

                <div className="additionalInfo mb-3">
                  <h4 style={{ fontWeight: "700" }}>Additional Information</h4>
                  <p>
                    <strong>Item Details:</strong>
                    <p style={{ textIndent: "3em", textAlign: "justify" }}>{product.item_details}</p>
                  </p>
                  <p>
                    <strong>How to Use:</strong>
                    <p style={{ textIndent: "3em", textAlign: "justify" }}>{product.how_to_use}</p>
                  </p>
                  <p>
                    <strong>Composition:</strong>
                    <p style={{ textIndent: "3em", textAlign: "justify" }}>{product.composition}</p>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DistributorProductView;