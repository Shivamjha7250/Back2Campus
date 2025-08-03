// File: frontend/pages/RequestedPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from './apiConfig';
import { Check, X } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io(API_BASE_URL);

// RequestCard component
const RequestCard = ({ request, onAction }) => {
    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <Link to={`/profile/${request.sender._id}`} className="flex items-center gap-3 group">
                <img 
                    src={request.sender.profile?.avatar ? `${API_BASE_URL}${request.sender.profile.avatar}` : 'https://placehold.co/48x48/EFEFEF/AAAAAA&text=A'} 
                    alt={request.sender.firstName}
                    className="w-12 h-12 rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div>
                    <p className="font-bold group-hover:text-blue-600">{request.sender.firstName} {request.sender.lastName}</p>
                    <p className="text-sm text-gray-500">{request.sender.userType || 'Student'}</p>
                </div>
            </Link>
            <div className="flex gap-2">
                <button 
                    onClick={() => onAction(request._id, 'accept')}
                    className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                    title="Accept"
                >
                    <Check size={20} />
                </button>
                <button 
                    onClick={() => onAction(request._id, 'reject')}
                    className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                    title="Reject"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

const RequestedPage = () => {
    const { user: currentUser } = useOutletContext();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial requests fetch karein
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${API_BASE_URL}/api/connections/received`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setRequests(data);
            } catch (error) {
                console.error("Failed to fetch requests:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    // Real-time updates ke liye listener set karein
    useEffect(() => {
        if (currentUser) {
            const eventName = `connection_request_${currentUser._id}`;
            
            socket.on(eventName, (newRequest) => {
                setRequests(prevRequests => {
                    const isAlreadyPresent = prevRequests.some(req => req._id === newRequest._id);
                    return isAlreadyPresent ? prevRequests : [newRequest, ...prevRequests];
                });
            });

            return () => {
                socket.off(eventName);
            };
        }
    }, [currentUser]);

    const handleAction = async (requestId, action) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/api/connections/respond`, 
                { requestId, action },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setRequests(prevRequests => prevRequests.filter(req => req._id !== requestId));
        } catch (error) {
            console.error(`Failed to ${action} request:`, error);
            alert(`Could not ${action} the request. Please try again.`);
        }
    };

    if (loading) {
        return <div className="bg-white p-6 rounded-xl"><h2 className="text-2xl font-bold">Loading requests...</h2></div>;
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-2xl font-bold mb-4">Connection Requests</h2>
            {requests.length > 0 ? (
                <div className="space-y-3">
                    {requests.map(request => (
                        <RequestCard key={request._id} request={request} onAction={handleAction} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500">You have no new connection requests.</p>
                </div>
            )}
        </div>
    );
};

export default RequestedPage;
