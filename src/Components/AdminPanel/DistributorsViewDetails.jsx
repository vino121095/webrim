import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import compressor from '../User/Assets/compressor-img.png';
import baseurl from '../ApiService/ApiService';
import axios from 'axios';

const DistributorsViewDetails = () => {
    const { id } = useParams();
    const [distributor, setDistributor] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDistributorDetails = async () => {
            console.log(distributor);
            try {
                setLoading(true);
                const response = await axios.get(`${baseurl}/api/getDistributorById/${id}`);
                setDistributor(response.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching distributor details:', error);
                setError('Failed to load distributor details');
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if we don't have the distributor data from state
        if (!distributor) {
            fetchDistributorDetails();
        } else {
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Image Section - 4 columns wide on medium and larger screens */}
                <div className="col-md-12">
                    <div className="w-100">
                        {distributor?.image ? (
                            <img 
                                src={`${baseurl}/${distributor.image[0].image_path}`} 
                                alt="Distributor" 
                                className="img-fluid rounded distributor-img" 
                                onError={(e) => {
                                    e.target.src = compressor; // Fallback image
                                }}
                            />
                        ) : (
                            <img 
                                src={compressor} 
                                alt="Default" 
                                className="img-fluid rounded" 
                            />
                        )}
                    </div>
                </div>

                {/* Details Section - 8 columns wide on medium and larger screens */}
                <div className="col-md-12 mt-4">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Distributor Details</h4>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Company Name:</strong> {distributor?.companyname || 'N/A'}</p>
                                    <p><strong>Location:</strong> {distributor?.location || 'N/A'}</p>
                                    <p><strong>GST Number:</strong> {distributor?.gstnumber || 'N/A'}</p>
                                    <p><strong>Credit Limit:</strong> {distributor?.creditlimit || 'N/A'}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Name:</strong> {distributor?.contact_person_name || 'N/A'}</p>
                                    <p><strong>Phone Number:</strong> {distributor?.phoneno || 'N/A'}</p>
                                    <p><strong>Email:</strong> {distributor?.email || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DistributorsViewDetails;