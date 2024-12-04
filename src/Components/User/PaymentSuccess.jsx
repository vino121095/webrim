import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from './NavBar';

const PaymentSuccess = ({ message}) => {
  const navigate = useNavigate()
  useEffect(() => {
    const LoggedUser = JSON.parse(localStorage.getItem("userData"));
    if (!LoggedUser) {
      navigate("/");
    } else if (LoggedUser.role === "admin") {
      navigate("/AdminDashboard/EnterpriseAi");
    }
    else if(LoggedUser.role === "technician"){
      navigate('/User/StoreDetails');
    }
  }, [navigate]); // Removed LoggedUser from dependency array

    const handleContinueShopping = ()=>{
        navigate('/')
    }

  return (
     <>
     <NavBar />
     <div className="mt-5 d-flex flex-column">
      {/* Main Content */}
      <main className="flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-6 text-center">
              <div className="bg-white p-4">
                {/* Success Icon */}
                <div className="mb-4">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center" 
                       style={{ width: '80px', height: '80px',backgroundColor:'#00bc00' }}>
                    <i className="bi bi-check-lg text-white" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                </div>

                {/* Success Text */}
                <h2 className="mb-3" style={{ fontSize: '2rem',color:'#4aac52' }}>
                  Success!
                </h2>
                <p className="text-dark mb-4">
                  {message || 'Your order has successfully been submitted'}
                </p>

                {/* Continue Shopping Button */}
                <button 
                  onClick={handleContinueShopping}
                  className="btn btn-outline-primary rounded-pill px-4 py-2"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
     </> 
    
  );
};

export default PaymentSuccess;