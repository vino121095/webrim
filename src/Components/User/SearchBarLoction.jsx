import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBarLocation = ({ onLocationSearch }) => {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState("");

  const handleLocationSearch = () => {
    // Pass the search location to the parent component
    onLocationSearch(searchLocation);
  };

  return (
    <div className="searchBarLocation container mt-5">
      <div className="row align-items-center justify-content-center">
        {/* Forum Button */}
        <div className="col-12 col-md-auto mb-3 mb-md-0 forum-div">
          <button
            className="btn text-white px-4 d-flex align-items-center justify-content-center w-100 forum-button"
            style={{
              backgroundColor: "#0000ff",
              height: "60px",
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
            className="border d-flex align-items-center px-3 flex-nowrap"
            style={{
              height: "60px",
              borderColor: "#e9e9e9",
              borderRadius: "20px",
              overflowX: "auto",
            }}
          >
            <ul className="d-flex list-unstyled align-items-center mb-0 w-100">
              {/* Search Input */}
              <li className="flex-grow-1">
                <input
                  type="text"
                  className="form-control shadow-none"
                  placeholder="Enter Location..."
                  value={searchLocation}
                 onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyUp={(e) => {
                    // if (e.key === 'Enter') {
                    //   handleLocationSearch();
                    // }
                    handleLocationSearch();
                  }}
                  style={{ height: "100%" }}
                />
              </li>

              {/* Search Button */}

              {/* Quick Location Links */}
              <li className="px-2">
                <a
                  href="#"
                  className="text-dark text-decoration-none d-flex align-items-center"
                  style={{ whiteSpace: "nowrap" }}
                  onClick={() => onLocationSearch("nearme")}
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
                  <a 
                    href="#" 
                    className="text-dark text-decoration-none"
                    onClick={() => onLocationSearch(location)}
                  >
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