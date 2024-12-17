import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import baseurl from "../ApiService/ApiService";

const SearchBarLocation = ({ onLocationSearch, onSearchNear }) => {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [currentDistrict, setCurrentDistrict] = useState("");
  const [districts, setDistricts] = useState([]);
  const [error, setError] = useState(null);

  // Haversine formula to calculate distance between two points on Earth
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  useEffect(() => {
    const fetchCurrentLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            try {
              const apiKey = "a3317655231447b6b370288bb881de3f";
              const response = await axios.get(
                `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`
              );

              if (response.data.results.length > 0) {
                const components = response.data.results[0].components;
                
                // More robust state and district extraction
                const stateName = components.state || 
                                   components.state_district || 
                                   components.administrative_area_level_1 || 
                                   "Unknown State";
                const districtName = components.state_district || components.county || 
                                     components.city || 
                                     components.administrative_area_level_2 || 
                                     "Unknown District";

                setCurrentLocation(stateName);
                setCurrentDistrict(districtName);

                // Fetch districts for the current state
                await fetchDistrictsForState(stateName);
              } else {
                setError("Location details not found");
                setCurrentLocation("Location not found");
              }
            } catch (error) {
              console.error("Geocoding error:", error);
              setError("Unable to fetch location details");
              setCurrentLocation("Unable to fetch location");
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            setError("Geolocation access denied");
            setCurrentLocation("Location access denied");
          }
        );
      } else {
        setError("Geolocation not supported");
        setCurrentLocation("Geolocation not supported by your browser");
      }
    };

    fetchCurrentLocation();
  }, []);

  const fetchDistrictsForState = async (stateName) => {
    try {
      const statesResponse = await axios.get(`${baseurl}/api/states`);
      const statesData = await statesResponse.data;
    
      const state = statesData.states.find(s =>
        stateName.toLowerCase().includes(s.state_name.toLowerCase()) ||
        s.state_name.toLowerCase().includes(stateName.toLowerCase())
      );
    
      if (state) {
        const districtsResponse = await axios.get(`${baseurl}/api/districts/${state.state_id}`);
        const districtsData = await districtsResponse.data;
    
        const first5Districts = districtsData.districts 
          ? districtsData.districts.slice(0, 5).map(district => district.district_name)
          : [];
    
        if (first5Districts.length === 0) {
          setError("No districts found for this state");
        }
        setDistricts(first5Districts);
      } else {
        setError(`State not found: ${stateName}`);
        setDistricts([]);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      setError("Failed to fetch districts");
      setDistricts([]);
    }
  };

  const fetchSurroundingDistricts = async () => {
    try {
      // First, get the coordinates for the current district
      const apiKey = "a3317655231447b6b370288bb881de3f";
      const locationQuery = `${currentDistrict}, ${currentLocation}`;
      
      const geocodingResponse = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(locationQuery)}&key=${apiKey}`
      );

      // Check if we got valid coordinates
      if (geocodingResponse.data.results.length === 0) {
        setError("Could not find coordinates for the current location");
        return;
      }

      const currentLocationCoords = geocodingResponse.data.results[0].geometry;
      const { lat: currentLat, lng: currentLon } = currentLocationCoords;

      // Fetch states and districts
      const statesResponse = await axios.get(`${baseurl}/api/states`);
      const statesData = await statesResponse.data;
  
      // Find state more flexibly
      const state = statesData.states.find(s => 
        currentLocation.toLowerCase().includes(s.state_name.toLowerCase()) ||
        s.state_name.toLowerCase().includes(currentLocation.toLowerCase())
      );
  
      if (state) {
        const districtsResponse = await axios.get(`${baseurl}/api/districts/${state.state_id}`);
        const districtsData = await districtsResponse.data;

        // Fetch coordinates for each district
        const districtCoordinatesPromises = districtsData.districts.map(async (district) => {
          try {
            const districtQuery = `${district.district_name}, ${currentLocation}`;
            const response = await axios.get(
              `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(districtQuery)}&key=${apiKey}`
            );

            if (response.data.results.length > 0) {
              return {
                ...district,
                coordinates: response.data.results[0].geometry
              };
            }
            return null;
          } catch (err) {
            console.error(`Error geocoding ${district.district_name}:`, err);
            return null;
          }
        });

        // Wait for all district coordinates to be fetched
        const districtsWithCoordinates = (await Promise.all(districtCoordinatesPromises))
          .filter(district => district !== null);

        // Calculate distances and sort
        const distancesFromCurrentDistrict = districtsWithCoordinates.map(district => ({
          ...district,
          distance: calculateDistance(
            currentLat, 
            currentLon, 
            district.coordinates.lat, 
            district.coordinates.lng
          )
        }));

        // Sort by distance and select the 5 closest districts (excluding current district)
        const surroundingDistricts = distancesFromCurrentDistrict
          .filter(district => 
            district.district_name.toLowerCase() !== currentDistrict.toLowerCase()
          )
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5)
          .map(district => district.district_name);
          onSearchNear(surroundingDistricts)
        setDistricts(surroundingDistricts);
        setError(""); // Clear any previous errors
      } else {
        setError(`State not found for the location: ${currentLocation}`);
        setDistricts([]);
      }
    } catch (error) {
      console.error('Error fetching surrounding districts:', error);
      setError("Failed to fetch surrounding districts. Please try again.");
      setDistricts([]);
    }
  };

  // Add the missing handleLocationSearch function
  const handleLocationSearch = () => {
    // // If it's a key event, only process if it's the Enter key
    // if (event.type === 'keyup' && event.key !== 'Enter') {
    //   return;
    // }

    // // Trim and validate the search location
    // const location = searchLocation.trim();
    // if (location) {
      onLocationSearch(searchLocation);
    // }
  };

  const handleNearMeClick = () => {
    fetchSurroundingDistricts();
    onLocationSearch("nearme");
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
              height: "40px",
              fontSize: "20px",
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
            <ul className="d-flex list-unstyled align-items-center mb-0 w-100 location_search_links">
              {/* Search Input */}
              <li className="flex-grow-1">
                <input
                  type="text"
                  className="form-control shadow-none"
                  placeholder="Enter Location..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyUp={() => handleLocationSearch()}
                  style={{ height: "100%" }}
                />
              </li>

              {/* Near Me Link */}
              <li className="px-2">
                <a
                  href="#"
                  className="text-dark text-decoration-none d-flex align-items-center"
                  style={{ whiteSpace: "nowrap" }}
                  onClick={handleNearMeClick}
                >
                  <i className="bi bi-crosshair me-2"></i>
                  <span>Near Me</span>
                </a>
              </li>

              {/* Dynamic Districts */}
              {districts.map((district, index) => (
                <li key={index} className="px-2">
                  <a 
                    href="#" 
                    className="text-dark text-decoration-none"
                    onClick={() => onLocationSearch(district)}
                  >
                    {district}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="col-12 mt-2">
            <div className="alert alert-warning">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBarLocation;