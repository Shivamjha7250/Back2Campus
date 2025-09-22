import React, { useState, useRef, useEffect } from 'react';
import { Camera, Eye, ImagePlus, Trash2 } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../pages/apiConfig';

const PLACEHOLDER = 'https://placehold.co/128x128';

const ProfilePhotoManager = ({ user, onPhotoUpdate = () => {} }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState(PLACEHOLDER);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const localAvatar = localStorage.getItem('profileAvatar');
    if (localAvatar && localAvatar !== PLACEHOLDER) {
      setAvatar(localAvatar);
      return;
    }

    const possibleUrl =
      user?.profile?.avatar?.url ||
      user?.avatar?.url ||
      user?.avatarUrl ||
      user?.avatar;

    if (possibleUrl && typeof possibleUrl === 'string' && possibleUrl !== PLACEHOLDER) {
      setAvatar(possibleUrl);
      localStorage.setItem('profileAvatar', possibleUrl);
    } else {
      setAvatar(PLACEHOLDER);
      localStorage.removeItem('profileAvatar');
    }
  }, [user]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API_BASE_URL}/api/users/profile-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedAvatarUrl = `${data.avatarUrl}?t=${Date.now()}`;
      setAvatar(updatedAvatarUrl);
      localStorage.setItem('profileAvatar', updatedAvatarUrl);
      onPhotoUpdate(updatedAvatarUrl);
    } catch (error) {
      alert('Failed to upload photo. Please try again.');
    } finally {
      setLoading(false);
      setMenuOpen(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (window.confirm('Are you sure you want to remove your profile picture?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/api/users/profile-picture`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAvatar(PLACEHOLDER);
        localStorage.removeItem('profileAvatar');
        onPhotoUpdate(PLACEHOLDER);
        setMenuOpen(false);
      } catch (error) {
        alert('Failed to remove photo. Please try again.');
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.profile-photo-manager')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="profile-photo-manager relative w-32 h-32 mx-auto">
      <img
        src={avatar}
        alt="Profile"
        className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
        onError={(e) => {
          if (e.target.src !== PLACEHOLDER) {
            e.target.src = PLACEHOLDER;
            localStorage.removeItem('profileAvatar');
          }
        }}
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full">
          <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        aria-label="Manage profile photo"
        aria-expanded={menuOpen}
        aria-controls="profile-photo-menu"
        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <Camera size={20} />
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg, image/webp"
      />

      {menuOpen && (
        <div
          id="profile-photo-menu"
          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border z-20 text-gray-700 text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {avatar && avatar !== PLACEHOLDER && (
            <a
              href={avatar}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-full gap-3 px-4 py-2 hover:bg-gray-100 border-b"
              onClick={() => setMenuOpen(false)}
            >
              <Eye size={16} /> View Photo
            </a>
          )}

          <button
            onClick={() => {
              fileInputRef.current?.click();
              setMenuOpen(false);
            }}
            className="flex items-center w-full gap-3 px-4 py-2 hover:bg-gray-100 border-b"
          >
            <ImagePlus size={16} /> Change Photo
          </button>

          {avatar && avatar !== PLACEHOLDER && (
            <button
              onClick={handleRemovePhoto}
              className="flex items-center w-full gap-3 px-4 py-2 hover:bg-gray-100 text-red-600"
            >
              <Trash2 size={16} /> Remove Photo
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoManager;
