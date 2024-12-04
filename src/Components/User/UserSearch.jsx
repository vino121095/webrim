import React, { useState, useEffect } from 'react';

const UserSearch = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {screenWidth > 768 ? (
        <div
          className="w-50 d-flex align-items-center border px-3 mt-5"
          style={{
            height: "50px",
            width: "100%",
            borderRadius: "20px",
            marginLeft: "25%",
          }}
        >
          {/* Search Input */}
          <input
            type="text"
            className="form-control border-0 shadow-none px-3"
            placeholder="Search"
            style={{ flex: 1 }}
          />

          {/* Icons Container */}
          <div className="d-flex align-items-center gap-3">
            {/* Close Icon */}
            <i className="bi bi-x-lg"></i>

            {/* Divider */}
            <div className="vr" style={{ height: "40px", backgroundColor: "#808080" }}></div>

            {/* Microphone Icon */}
            <i className="bi bi-mic-fill"></i>

            {/* Search Icon */}
            <i className="bi bi-search"></i>
          </div>
        </div>
      ) : (
        <div
          className="d-flex align-items-center border px-3"
          style={{
            height: "40px",
            width: "50%",
            marginTop: "3%",
            borderRadius: "20px",
            marginLeft: "25%",
          }}
        >
          {/* Search Input */}
          <input
            type="text"
            className="form-control border-0 shadow-none px-3"
            placeholder="Search"
            style={{ flex: 1 }}
          />

          {/* Icons Container */}
          <div className="d-flex align-items-center gap-3">
            {/* Search Icon */}
            <i className="bi bi-search"></i>
          </div>
        </div>
      )}
    </>
  );
};

export default UserSearch;
