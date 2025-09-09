import React, { useState, useRef } from 'react';
import { Camera, Eye, ImagePlus, Trash2 } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../pages/apiConfig';

const ProfilePhotoManager = ({ user, onPhotoUpdate = () => {} }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

  
  const avatarUrl = user.profile?.avatar
    ? `${API_BASE_URL}${user.profile.avatar}`
    : 'https://placehold.co/128x128';


  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`${API_BASE_URL}/api/users/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      onPhotoUpdate(data.avatarUrl); 
      setMenuOpen(false);
    } catch (error) {
      console.error('Failed to upload photo:', error);
      
    }
  };

  
  const handleRemovePhoto = async () => {
  
    if (window.confirm('Are you sure you want to remove your profile picture?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/api/users/profile-picture`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        onPhotoUpdate(''); 
        setMenuOpen(false);
      } catch (error) {
        console.error('Failed to remove photo:', error);
      
      }
    }
  };

  return (
    <div className="relative w-32 h-32 mx-auto">
      <img
        src={avatarUrl}
        alt="Profile"
        className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
      />

    
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Camera size={20} />
      </button>

    
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg"
      />

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border z-20 text-gray-700 text-sm">
          <a
            href={avatarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full gap-3 px-4 py-2 hover:bg-gray-100"
            onClick={() => setMenuOpen(false)}
          >
            <Eye size={16} /> View Photo
          </a>
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center w-full gap-3 px-4 py-2 hover:bg-gray-100"
          >
            <ImagePlus size={16} /> Change Photo
          </button>
          <button
            onClick={handleRemovePhoto}
            className="flex items-center w-full gap-3 px-4 py-2 hover:bg-gray-100 text-red-600"
          >
            <Trash2 size={16} /> Remove Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoManager;