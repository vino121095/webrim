import React, { useState, useEffect } from 'react'
import StoreImg from '../User/Assets/store-img.png'
import phone from '../User/Assets/phone.png'
import { useNavigate } from 'react-router-dom'
import NavBar from './NavBar';
import UserSearch from './UserSearch';
import SearchBarLocation from './SearchBarLoction';
import axios from 'axios'; // Make sure to install axios: npm install axios
import baseurl from '../ApiService/ApiService'

const StoreDetails = () => {
    const navigate = useNavigate();
    const [distributors, setDistributors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const LoggedUser = JSON.parse(localStorage.getItem("userData"));
        if (!LoggedUser) {
          navigate("/");
        } else if (LoggedUser.role === "admin") {
          navigate("/AdminDashboard/EnterpriseAi");
        }
        else if(LoggedUser.role === "distributor"){
          navigate('/');
        }
      }, [navigate]); // Removed LoggedUser from dependency array
      
    useEffect(() => {
        const fetchDistributors = async () => {
            try {
                const response = await axios.get(`${baseurl}/api/getAllDistributors`);
                setDistributors(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching distributors:', err);
                setError('Failed to fetch distributors');
                setLoading(false);
            }
        };

        fetchDistributors();
    }, []);

    if (loading) {
        return (
            <>
                <NavBar/>
                <UserSearch/>
                <SearchBarLocation/>
                <div className="container mt-5 text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <NavBar/>
                <UserSearch/>
                <SearchBarLocation/>
                <div className="container mt-5 text-center text-danger">
                    {error}
                </div>
            </>
        );
    }

    return (
        <>
            <NavBar/>
            <UserSearch/>
            <SearchBarLocation/>
            <div className="container mt-5 mb-3">
                <div className="row g-4">
                    {distributors.map((distributor, index) => (
                        <div key={distributor.did || index} className="col-6 col-sm-6 col-md-4 col-lg-3">
                            <div className="card product-card h-100">
                                <img 
                                    src={`${baseurl}/${distributor.image[0]?.image_path || StoreImg}`} 
                                    className="card-img-top img-fluid rounded-3 p-3" 
                                    alt={distributor.name || "Distributor"} 
                                />
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title fw-bolder">{distributor.companyname || 'Smart Accessories'}</h5>
                                    {/* // <h6 className="card-text mt-1">{distributor.description || 'AC Spare parts Wholesalers'}</h6> */}
                                    <h6 className="card-text mt-1">{distributor.location || 'Gandhipuram Coimbatore'}</h6>
                                    <div className="text-center mt-auto">
                                        <a 
                                            href={`tel:${distributor.phoneno}`} 
                                            className="btn w-100 fw-semibold view-mobile-no"
                                        >
                                            <img src={phone} alt="Phone" /> View Mobile Number
                                        </a>
                                    </div>
                                    <div className="text-center mt-auto">
                                        <a 
                                            href="#" 
                                            className="btn w-100 fw-semibold contact-supplier-btn"
                                            onClick={() => navigate(`/contact-supplier/${distributor.id}`)}
                                        >
                                            Contact Supplier
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default StoreDetails