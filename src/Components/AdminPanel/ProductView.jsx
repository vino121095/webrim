import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Share2 } from "lucide-react";
import compressor from "../User/Assets/compressor-img.png";
import baseurl from "../ApiService/ApiService";

const ProductView = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(baseurl + "/api/getAllProducts");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleProductViewDetails = (product) => {
    navigate(`/AdminDashboard/products/productViewDetails/${product.pid}`);
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        {products.map((product) => (
          <div key={product.pid} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="card shadow-sm product-view-card h-100">
            <div className='card-img d-flex align-items-center justify-content-center' style={{ height: '200px' }}>
              <img
                src={baseurl + `/${product.images[0]?.image_path}` || compressor}
                alt={product.product_name}
                style={{ objectFit: 'contain' }}
                className="card-img-top rounded-3 p-3 mw-100 mh-100"
              />
              </div>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.product_name}</h5>
                <hr className="my-2" />
                <h6 className="mb-2"><i class="bi bi-currency-rupee"></i> {product.mrp_rate}</h6>
                <p className="text-muted mb-3">
                  <small>{product.brand_name}</small>
                </p>
                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <button
                    className="btn border btn-sm"
                    onClick={() => handleProductViewDetails(product)}
                  >
                    View Details
                  </button>
                  <button className="btn btn-light btn-sm rounded-circle">
                    <Share2 size={16} style={{color:''}} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductView;
