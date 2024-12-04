import React from "react";
import { useNavigate } from "react-router-dom";

const SearchBarLocation = () => {
  const navigate = useNavigate();
  return (
    <div className="searchBarLocation container mt-5">
      <div className="row align-items-center justify-content-center">
        {/* Forum Button */}
        <div className="col-12 col-md-auto mb-3 mb-md-0 forum-div">
          <button
            className="btn text-white px-4 d-flex align-items-center justify-content-center w-100 forum-button"
            style={{
              backgroundColor: "#0000ff", // Button background color
              height: "60px", // Matches input height
              fontSize: "24px",
              borderRadius: "10px",
            }}
            onClick={() => navigate("/user/FeedViews")}
          >
            <i className="bi bi-box-seam me-2"></i> Forum
          </button>
        </div>

        {/* Search Input and Location Links */}
        <div className="col-12 col-md location_searchbar">
          <div
            className="border d-flex align-items-center px-3 flex-nowrap" // Add flex-nowrap to prevent wrapping
            style={{
              height: "60px", // Same height as the Forum button
              borderColor: "#e9e9e9",
              borderRadius: "20px",
              overflowX: "auto", // Allow horizontal scrolling if necessary
            }}
          >
            <ul className="d-flex list-unstyled align-items-center mb-0 w-100">
              {/* Search Input */}
              <li className="flex-grow-1">
                <input
                  type="text"
                  className="form-control shadow-none"
                  placeholder="Enter Location..."
                  style={{ height: "100%" }} // Full height of the container
                />
              </li>

              {/* Icons and Location Links */}
              <li className="px-2">
                <a
                  href="#"
                  className="text-dark text-decoration-none d-flex align-items-center"
                  style={{ whiteSpace: "nowrap" }} // Prevent wrapping
                >
                  <i className="bi bi-crosshair me-2 text-dark"></i>
                  <span>Near Me</span>
                </a>
              </li>

              {[
                "Coimbatore",
                "Chennai",
                "Kerala",
                "Goa",
                "Bangalore",
                "Pune",
              ].map((location, index) => (
                <li key={index} className="px-2">
                  <a href="#" className="text-dark text-decoration-none">
                    {location}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBarLocation;
