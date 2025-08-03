import React from 'react';
import ProfilePhotoManager from '../components/ProfilePhotoManager'; // Naya component import karein

const RightSidebar = ({ user, onPhotoUpdate }) => {
    return (
        <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white p-6 rounded-xl text-center">
                {/* ✅ ProfilePhotoManager component ka istemal */}
                <ProfilePhotoManager user={user} onPhotoUpdate={onPhotoUpdate} />
                
                <h3 className="text-xl font-bold mt-4">{user.firstName} {user.lastName}</h3>
                <p className="text-sm text-gray-500">{user.userType || 'Alumni'}</p>

                {/* ✅ Educational History aur Internship wala section */}
                <div className="text-left mt-4 pt-4">
                    <p className="text-sm"><strong>Educational History:</strong> {user.profile?.education || 'Not specified'}</p>
                    <p className="text-sm"><strong>Internship:</strong> {user.profile?.internship || 'Not specified'}</p>
                </div>
            </div>

            {/* My Posts wala card */}
            <div className="bg-white p-4 rounded-xl">
                <h4 className="font-bold mb-2">My Posts</h4>
                <p className="text-sm text-gray-400">You haven't posted anything yet.</p>
            </div>
        </div>
    );
};

export default RightSidebar;
