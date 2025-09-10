import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from './apiConfig';
import { useOutletContext } from 'react-router-dom';
import { Link } from 'react-router-dom';


const UserCard = ({ user, currentUser, onConnectionUpdate }) => {
    
    const getInitialStatus = () => {
        if (currentUser.connections?.includes(user._id)) {
            return 'connected';
        }
        if (currentUser.sentRequests?.includes(user._id)) {
            return 'pending';
        }
        return 'connect';
    };

    const [connectionStatus, setConnectionStatus] = useState(getInitialStatus);

    const handleConnect = async () => {
        setConnectionStatus('pending'); 
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/api/connections/send`, 
                { receiverId: user._id },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            onConnectionUpdate(user._id);
        } catch (error) {
            console.error(`Failed to send request to ${user.firstName}:`, error);
            setConnectionStatus('connect');
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col items-center text-center">
            <Link to={`/profile/${user._id}`}>
                <img 
                    
                    src={user.profile?.avatar ? user.profile.avatar : 'https://placehold.co/80x80/EFEFEF/AAAAAA&text=A'} 
                    alt={user.firstName} 
                    className="w-20 h-20 rounded-full object-cover mb-3 transition-transform duration-300 hover:scale-105"
                />
            </Link>
            <Link to={`/profile/${user._id}`}>
                <p className="font-bold hover:text-blue-600">{user.firstName} {user.lastName}</p>
            </Link>
            <p className="text-sm text-gray-500 mb-4">{user.userType || 'Student'}</p>
            <button 
                onClick={handleConnect}
                disabled={connectionStatus !== 'connect'}
                className={`w-full px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                    connectionStatus === 'connect' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                    connectionStatus === 'pending' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                    'bg-green-600 text-white cursor-not-allowed'
                }`}
            >
                {connectionStatus === 'connect' ? 'Connect' : connectionStatus === 'pending' ? 'Pending' : 'Connected'}
            </button>
        </div>
    );
};


const FindUsersPage = () => {
    
    const { user: initialUser } = useOutletContext();
    const [currentUser, setCurrentUser] = useState(initialUser);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!currentUser) return;
            try {
                const token = localStorage.getItem('token');
            
                const usersResponse = await axios.get(`${API_BASE_URL}/api/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const currentUserResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                setCurrentUser(currentUserResponse.data);
                setUsers(usersResponse.data.filter(user => user._id !== currentUser._id));

            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchAllData();
    }, []);

    
    const handleConnectionUpdate = (sentToUserId) => {
        setCurrentUser(prevUser => ({
            ...prevUser,
            sentRequests: [...prevUser.sentRequests, sentToUserId]
        }));
    };

    if (loading) return <p>Loading users...</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Find Users</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {users.map(user => (
                    <UserCard 
                        key={user._id} 
                        user={user} 
                        currentUser={currentUser} 
                        onConnectionUpdate={handleConnectionUpdate}
                    />
                ))}
            </div>
        </div>
    );
};

export default FindUsersPage;