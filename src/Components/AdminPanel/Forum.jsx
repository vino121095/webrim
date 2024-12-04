import React, { useState, useEffect } from "react";
import axios from "axios";
import baseurl from "../ApiService/ApiService";
import Compressor from "../User/Assets/compressor-img.png";

const Forum = () => {
  const [forums, setForums] = useState([]);
  const [products, setProducts] = useState([]);
  const user = JSON.parse(localStorage.getItem("userData"));

  // Fetch all forums (including those not taken)
  const fetchAllForums = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/forums`);
      setForums(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching forums:", error);
      setForums([]);
    }
  };

  // Fetch all products to match with forum listings
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/getAllProducts`);
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  // Handle taking a forum listing
  const handleTakeForum = async (forumId) => {
    if (!user || !user.uid) {
      alert("Please log in to take this forum listing");
      return;
    }

    try {
      const response = await axios.post(`${baseurl}/api/forumtake/${forumId}`, {
        distributor_id: user.uid,
      });
      alert(response.data.message);
      fetchAllForums(); // Refresh the forums list
    } catch (error) {
      alert(
        error.response?.data.message || "Failed to take forum listing"
      );
      console.error("Forum take error:", error);
    }
  };

  // Fetch forums and products on component mount
  useEffect(() => {
    fetchAllForums();
    fetchProducts();
  }, []);

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        {forums.length > 0 ? (
          forums.map((forum) => {
            const matchingProduct = products.find(
              (product) => product.product_name === forum.product_name
            );

            return (
              <div key={forum.fid} className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <img
                          src={
                            matchingProduct?.images?.[0]?.image_path
                              ? `${baseurl}/${matchingProduct.images[0].image_path}`
                              : Compressor
                          }
                          alt={matchingProduct?.product_name || "Product"}
                          className="img-fluid rounded"
                          style={{
                            width: "100%",
                            marginTop: "40px",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <div className="col-md-9">
                      <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>Product Name : </strong>
                        <span>{matchingProduct?.product_name || "N/A"}</span>
                      </div>
                      <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>Needed Quantity : </strong> {forum.quantity || "N/A"}
                      </div>
                      <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>Post by : </strong> {forum.name || "Unknown"}
                      </div>
                      <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>Close Date : </strong> {forum.close_date ? new Date(forum.close_date).toLocaleDateString() : "No Date"}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn" style={{
                                backgroundColor: "orangered",
                                color: "white",
                                border: "none",
                              }}>Take</button>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center">No forums available.</p>
        )}
      </div>
    </div>
  );
};

export default Forum;
