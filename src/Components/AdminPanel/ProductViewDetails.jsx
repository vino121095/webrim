import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Package, ShoppingCart } from "lucide-react";
import defaultImage from "../User/Assets/compressor-img.png";
import baseurl from "../ApiService/ApiService";

const ProductViewDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(defaultImage);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`${baseurl}/api/productDetail/${id}`);
        const fetchedProduct = response.data;

        // Extract image paths
        if (fetchedProduct.images && Array.isArray(fetchedProduct.images)) {
          fetchedProduct.images = fetchedProduct.images.map((img) => img.image_path);
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

  return (
    <div className="container product-details-container my-4">
      <div className="row">
        {/* Image Section */}
        <div className="col-lg-6 mb-4 h-75">
          <div className="productImageSection bg-white w-100">
            <div className="text-center pt-4 d-flex justify-content-center " style={{height: '500px'}}>
            <img src={mainImage} alt="Main Product" className="mainImage img-fluid rounded border"
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
                <img src={defaultImage} alt="Default Thumbnail" className="thumbnail img-fluid border rounded" />
              )}
            </div>
          </div>
          {/* Product Stats */}
          <div className="productStatsSection d-flex flex-wrap mt-4">
            <div className="stockInfo flex-fill bg-white p-3 border rounded shadow-sm">
              <Package className="text-primary mb-2 me-2" size={24} /><span>Stocks</span>
              <p className="fw-bold">{product.stocks} / Pack</p>
            </div>
            <div className="salesInfo flex-fill bg-white p-3 border rounded shadow-sm">
              <ShoppingCart className="text-warning mb-2 me-2" size={24} /> <span>Sales</span>
              <p className="fw-bold">{product.sales} / Pack</p>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="col-lg-6">
          <div className="productInfoSection p-3 rounded shadow-sm bg-white">
            <div className="d-flex justify-content-between">
            <h4 className="productName">{product.product_name}</h4>
            <h3 className="productPrice text-primary"><i class="bi bi-currency-rupee"></i> {product.mrp_rate}</h3>
            </div>
            <p><strong>ID Product:</strong> {product.product_id}</p>

            <div className="aboutProduct mb-3">
              <h4>About Product</h4>
              <p>{product.product_description}</p>
            </div>

            <div className="additionalInfo">
              <h4>Additional Information</h4>
              <p><strong>Item Details:</strong> {product.item_details}</p>
              <p><strong>How to Use:</strong> {product.how_to_use}</p>
              <p><strong>Composition:</strong> {product.composition}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductViewDetails;