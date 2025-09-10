import React from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../pages/apiConfig';
import { X } from 'lucide-react';

const LikersModal = ({ users, onClose }) => {
    if (!users) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg">Liked by</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 max-h-80 overflow-y-auto">
                    {users.length > 0 ? (
                        <div className="space-y-3">
                            {users.map(user => (
                                <Link to={`/profile/${user._id}`} key={user._id} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg" onClick={onClose}>
                                    <img 
                                        
                                        src={user.profile?.avatar ? user.profile.avatar : 'https://placehold.co/40x40'} 
                                        alt={user.firstName}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <span className="font-semibold">{user.firstName} {user.lastName}</span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">No likes yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LikersModal;