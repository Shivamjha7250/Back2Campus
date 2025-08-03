import React from 'react';

const UserProfileCard = ({ user }) => {
    return (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl shadow-sm sticky top-4">
            <h3 className="font-bold mb-2">{user.firstName} {user.lastName}</h3>
            <p className="text-sm text-gray-500 capitalize">{user.userType}</p>
            <div className="mt-4 text-xs text-gray-600 space-y-2">
                <p><span className="font-semibold">Educational History:</span> Thakur College of Engineering (Mumbai University)</p>
                <p><span className="font-semibold">Passing Year:</span> 2022</p>
                <p><span className="font-semibold">Internship:</span> Web Dev Intern at TCS (6 Months)</p>
            </div>
        </div>
    );
};

export default UserProfileCard;