import React, { useState, useRef } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import API_BASE_URL from '../pages/apiConfig';

const ProfileCard = ({ user, onProfileUpdate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('userId', user._id);
        formData.append('avatar', file);
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/profile-photo`, {
                method: 'PUT',
                body: formData,
            });
            const updatedUser = await response.json();
            if (response.ok) onProfileUpdate(updatedUser);
        } catch (error) { console.error("Failed to change photo", error); }
    };

    const handleRemovePhoto = async () => {
        if(window.confirm('Are you sure you want to remove your profile picture?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/users/remove-photo`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user._id }),
                });
                const updatedUser = await response.json();
                if (response.ok) onProfileUpdate(updatedUser);
            } catch (error) { console.error("Failed to remove photo", error); }
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm sticky top-4 text-center">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
            
        
            <div className="relative inline-block mb-4">
                <img 
                    src={`${API_BASE_URL}${user.profile.avatar}`} 
                    className="h-28 w-28 rounded-full object-cover border-4 border-gray-200"
                />
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full border-2 border-white hover:bg-blue-700">
                    <Edit size={16}/>
                </button>
            
                {isMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10 text-left">
                        <a href={`${API_BASE_URL}${user.profile.avatar}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <Eye size={16}/> View Photo
                        </a>
                        <button onClick={() => fileInputRef.current.click()} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <Edit size={16}/> Change Photo
                        </button>
                        <button onClick={handleRemovePhoto} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                            <Trash2 size={16}/> Remove Photo
                        </button>
                    </div>
                )}
            </div>

            <h3 className="font-bold text-xl mb-1">{user.firstName} {user.lastName}</h3>
            <p className="text-sm text-gray-500 mb-4 capitalize">{user.userType}</p>
            
            <div className="text-left text-sm space-y-3 text-gray-700">
                <p><span className="font-semibold">Educational History:</span><br/> {user.profile.education}</p>
                <p><span className="font-semibold">Internship:</span><br/> {user.profile.internship}</p>
            </div>
            
            <div className="border-t my-4"></div>
            <h4 className="font-bold text-lg text-left">My Posts</h4>
            <p className="text-sm text-gray-500 mt-2">You haven't posted anything yet.</p>
        </div>
    );
};

export default ProfileCard;