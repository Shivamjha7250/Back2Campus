import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from './apiConfig';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { MessageSquare, MoreVertical, UserX } from 'lucide-react';
import { socket } from '../socket';

const ConnectionCard = ({ connection, onRemove }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    
    const handleChatClick = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const { data: conversation } = await axios.post(
                `${API_BASE_URL}/api/chat/initiate`,
                { receiverId: connection._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            
            navigate(`/chat`, { state: { conversation } });
        } catch (error) {
            console.error("Failed to initiate chat:", error);
            alert("Could not start chat. Please try again.");
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border text-center relative">
            <Link to={`/profile/${connection._id}`}>
                <img 
                    src={connection.profile?.avatar ? `${API_BASE_URL}${connection.profile.avatar}` : 'https://placehold.co/80x80/EFEFEF/AAAAAA&text=A'} 
                    alt={connection.firstName} 
                    className="w-20 h-20 rounded-full object-cover mb-3 mx-auto transition-transform duration-300 hover:scale-105"
                />
            </Link>
            <Link to={`/profile/${connection._id}`}>
                <p className="font-bold hover:text-blue-600">{connection.firstName} {connection.lastName}</p>
            </Link>
            <p className="text-sm text-gray-500 mb-4">{connection.userType || 'Student'}</p>
            
            <div className="flex flex-col gap-2">
                <button 
                    onClick={handleChatClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-blue-600 text-white hover:bg-blue-700"
                >
                    <MessageSquare size={16} /> Chat
                </button>
            </div>

            <div className="absolute top-2 right-2">
                <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-gray-100">
                    <MoreVertical size={20} />
                </button>
                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                        <button 
                            onClick={() => {
                                onRemove(connection._id);
                                setMenuOpen(false);
                            }}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                            <UserX size={16} /> Remove Connection
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const MyConnectionPage = () => {
    const { user: currentUser } = useOutletContext();
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${API_BASE_URL}/api/connections/my`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setConnections(data);
            } catch (error) {
                console.error("Failed to fetch connections:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConnections();
    }, []);

    useEffect(() => {
        if (currentUser) {
            const newConnectionEvent = `new_connection_${currentUser._id}`;
            const removeConnectionEvent = `connection_removed_${currentUser._id}`;
            
            const handleNewConnection = (newConnection) => {
                setConnections(prev => [newConnection, ...prev]);
            };

            const handleRemoveConnectionEvent = ({ connectionId }) => {
                setConnections(prev => prev.filter(c => c._id !== connectionId));
            };

            socket.on(newConnectionEvent, handleNewConnection);
            socket.on(removeConnectionEvent, handleRemoveConnectionEvent);

            return () => {
                socket.off(newConnectionEvent, handleNewConnection);
                socket.off(removeConnectionEvent, handleRemoveConnectionEvent);
            };
        }
    }, [currentUser]);


    const handleRemoveConnection = async (connectionId) => {
        if (window.confirm("Are you sure you want to remove this connection?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_BASE_URL}/api/connections/remove/${connectionId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (error) {
                console.error("Failed to remove connection:", error);
            }
        }
    };

    if (loading) return <p>Loading connections...</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">My Connections ({connections.length})</h2>
            {connections.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {connections.map(connection => (
                        <ConnectionCard key={connection._id} connection={connection} onRemove={handleRemoveConnection} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-white rounded-lg border">
                    <p className="text-gray-500">You haven't made any connections yet.</p>
                </div>
            )}
        </div>
    );
};

export default MyConnectionPage;
