import React, { useState, useEffect, useRef } from 'react';

const UserSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [spokenWords, setSpokenWords] = useState([]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const recognitionRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('userData'));
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize Speech Recognition
  const initSpeechRecognition = () => {
    // Check browser compatibility
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser.');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US'; // You can change the language
    recognition.interimResults = false;

    // Handle successful speech recognition
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();

      // Update search term and trigger search
      setSearchTerm(transcript);
      handleSearch(transcript);

      // Stop listening
      setIsListening(false);
    };

    // Handle errors
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setSpokenWords([]);
    };

    // Handle end of speech recognition
    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  };

  const handleSearch = (input) => {
    let value;

    if (typeof input === "string") {
      value = input;
    } else {
      value = input.target.value;
    }

    setSearchTerm(value);

    if (onSearch) {
      onSearch(value);
    }
  };

  const handleVoiceSearch = () => {
    // Lazy initialize speech recognition
    if (!recognitionRef.current) {
      recognitionRef.current = initSpeechRecognition();
    }

    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
        setSpokenWords([]);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
        setSpokenWords([]);
      }
    }
  };

  return (
    <>
      {screenWidth > 768 ? (
        <div
          className="w-100 d-flex align-items-center justify-content-center mt-5"
          style={{
            height: "50px",
          }}
        >
          <div className={`d-flex align-items-center border px-3 ${user.role === 'distributor' ? 'w-100' : 'w-50'} inner_div`} style={{borderRadius: "20px"}}> 
          {/* Search Input */}
          <input
            type="text"
            className="form-control border-0 shadow-none px-3"
            placeholder={isListening ? "Listening..." : "Search"}
            value={searchTerm}
            onChange={handleSearch}
            style={{ flex: 1 }}
          />

          {/* Icons Container */}
          <div className="d-flex align-items-center gap-3">
            {/* Close Icon */}
            <i className="bi bi-x-lg"
              onClick={() => {
                handleSearch("");
              }}
              style={{ cursor: "pointer" }}
            ></i>

            {/* Divider */}
            <div className="vr" style={{ height: "40px", backgroundColor: "#808080" }}></div>

            {/* Microphone Icon */}
            <i
              className={`bi ${isListening ? 'bi-mic-fill text-danger' : 'bi-mic'}`}
              onClick={handleVoiceSearch}
              style={{
                cursor: "pointer",
                color: isListening ? 'red' : 'inherit'
              }}
            ></i>

            {/* Search Icon */}
            <i className="bi bi-search"></i>
          </div>
          </div>
        </div>
      ) : (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            height: "40px",
            width: "100%",
            marginTop: "3%",
          }}
        >
          {/* Search Input */}
          <div className='d-flex align-items-center border px-3 inner_div'
            style={{ borderRadius: "20px", width: '80%' }}
          >
            <input
              type="text"
              className="form-control border-0 shadow-none px-3"
              placeholder={isListening ? "Listening..." : "Search"}
              value={searchTerm}
              onChange={handleSearch}
              style={{ flex: 1 }}
            />

            {/* Icons Container */}
            <div className="d-flex align-items-center gap-3">
              {/* Search Icon */}
              <i className="bi bi-search"></i>
              <div className="vr" style={{ height: "40px", backgroundColor: "#808080" }}></div>

              {/* Microphone Icon */}
              <i
                className={`bi ${isListening ? 'bi-mic-fill text-danger' : 'bi-mic'}`}
                onClick={handleVoiceSearch}
                style={{
                  cursor: "pointer",
                  color: isListening ? 'red' : 'inherit'
                }}
              ></i>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserSearch;
