import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../pages/apiConfig';
import UserProfileCard from '../components/UserProfileCard';
import { UserPlus } from 'lucide-react';

const UserProfilePage = () => {
    const { userId } = useParams();
    const { user: initialCurrentUser, refetchUser } = useOutletContext();

    const [profileUser, setProfileUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(initialCurrentUser);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const isOwnProfile = currentUser?._id === userId;

    const getInitialStatus = () => {
        if (isOwnProfile || !currentUser || !profileUser) return null;
        if (currentUser.connections?.includes(profileUser._id)) return 'connected';
        if (currentUser.sentRequests?.includes(profileUser._id)) return 'pending';
        return 'connect';
    };
    const [connectionStatus, setConnectionStatus] = useState('connect');

    useEffect(() => {
        setCurrentUser(initialCurrentUser);
        setConnectionStatus(getInitialStatus());
    }, [initialCurrentUser, profileUser]);

    const handleConnect = async () => {
        setConnectionStatus('pending');
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/api/connections/send`,
                { receiverId: profileUser._id },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (refetchUser) refetchUser();
        } catch (error) {
            console.error("Failed to send request:", error);
            setConnectionStatus('connect');
        }
    };
    
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setProfileUser(response.data);
            } catch (err) {
                setError('User not found.');
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchUserData();
    }, [userId]);

    if (loading) return <p className="text-center mt-8">Loading profile...</p>;
    if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

    return (
        <div className="max-w-2xl mx-auto mt-6 px-4">
            <h2 className="text-2xl font-bold mb-4">{profileUser?.firstName}'s Profile</h2>
            
            
            <UserProfileCard
                user={profileUser}
                connectionStatus={connectionStatus}
                onConnect={handleConnect}
                isOwnProfile={isOwnProfile}
            />
        </div>
    );
};

export default UserProfilePage;
