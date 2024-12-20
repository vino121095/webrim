import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import defaultImage from "../User/Assets/compressor-img.png";
import baseurl from "../ApiService/ApiService";
import NavBar from "./NavBar";
import Swal from "sweetalert2";

const DistributorProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(defaultImage);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const LoggedUser = JSON.parse(localStorage.getItem('userData'));
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    distributor_name: LoggedUser?.username || "",
    phone_number: LoggedUser?.mobile_number || ""
  });
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`${baseurl}/api/productDetail/${id}`);
        const fetchedProduct = response.data;

        // Extract image paths
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

  if (!product) {
    return <div>Loading...</div>;
  }
  const handleAddToCartClick = async (product) => {
    // setSelectedProduct(product);
    //   setFormData(prevData => ({
    //   ...prevData,
    //   quantity: 1,
    // }));
    // if (!selectedProduct || !formData.quantity || !formData.distributor_name || !formData.distributor_location || !formData.phone_number) {
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Incomplete Form',
    //     text: 'Please fill in all required fields.',
    //     confirmButtonText: 'OK',
    //     confirmButtonColor: '#3085d6'
    //   });
    //   return;
    // }

    try {
      // First, add to cart
      const cartResponse = await axios.post(`${baseurl}/api/addtocart`, {
        user_id: LoggedUser.uid,
        product_id: product.product_id,
        product_name: product.product_name,
        quantity: quantity,
        distributor_name: formData.distributor_name,
        // distributor_location: LoggedUser.location,
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
          } else {
            setIsModalOpen(false);
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
  }
  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1); // Ensure quantity doesn't go below 1
  };

  return (
    <>
      <NavBar />
      <ul
        className="breadcrumb"
        style={{
          padding: "10px 16px",
          listStyle: "none",
          backgroundColor: "#f8f9fa",
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "5px",
          margin: "0",
        }}
      >
        {/* Active item */}
        <li style={{ fontSize: "18px", margin: "0" }}>
          <a href="/" style={{ textDecoration: "none", color: "#007bff", fontWeight: "bold" }}>
            Home
          </a>
        </li>
        <li style={{ fontSize: "18px", margin: "0" }}>/</li>

        {/* Disabled item */}
        <li style={{ fontSize: "17px", margin: "0", color: "#6c757d", cursor: "not-allowed" }}>
          Product View
        </li>
      </ul>


      <div className="container product-details-container my-4">
        <div className="row">
          {/* Image Section */}
          <div className="col-lg-6 mb-4 h-75">
            <div className="productImageSection bg-white w-100">
              <div className="text-center pt-4 d-flex justify-content-center " style={{ height: '500px' }}>
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
            {/* Product Stats
            <div className="productStatsSection d-flex flex-wrap mt-4">
              <div className="stockInfo flex-fill bg-white p-3 border rounded shadow-sm">
                <Package className="text-primary mb-2 me-2" size={24} />
                <span>Stocks</span>
                <p className="fw-bold">{product.stocks} / Pack</p>
              </div>
              <div className="salesInfo flex-fill bg-white p-3 border rounded shadow-sm">
                <ShoppingCart className="text-warning mb-2 me-2" size={24} />{" "}
                <span>Sales</span>
                <p className="fw-bold">{product.sales} / Pack</p>
              </div>
            </div> */}
          </div>

          {/* Details Section */}
          <div className="col-lg-6">
            <div className="productInfoSection p-3 rounded shadow-sm bg-white d-flex justify-content-between flex-column">
              <div><div className="d-flex justify-content-between">
                <h4 className="productName">{product.product_name}</h4>
                <h3 className="productPrice text-primary">
                  <i className="bi bi-currency-rupee"></i> {product.mrp_rate}
                </h3>
              </div>
                <p>
                  <strong>ID Product:</strong> {product.product_id}
                </p>
                {/* Add to Cart Button */}
                <div className="d-flex flex-column flex-sm-row align-items-start justify-content-lg-center gap-2">
                  <div className="input-group" style={{ width: 'auto' }}>
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={decrementQuantity}
                    >
                      <i className="bi bi-dash"></i>
                    </button>

                    <span
                      className="input-group-text bg-white text-dark"
                      style={{ minWidth: '50px', justifyContent: 'center' }}
                    >
                      {quantity}
                    </span>

                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={incrementQuantity}
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>

                  <button
                    className="btn add-to-card-button d-flex align-items-center justify-content-center"
                    style={{ minWidth: '150px' }}
                    onClick={() => handleAddToCartClick(product, quantity)}
                  >
                    <i className="bi bi-cart-plus me-2"></i>
                    Add to Cart
                  </button>
                </div><br />

                <div className="aboutProduct mb-3">
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
