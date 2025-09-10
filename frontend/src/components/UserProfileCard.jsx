import React from 'react';
import { UserPlus } from 'lucide-react';
import API_BASE_URL from '../pages/apiConfig';

const UserProfileCard = ({ user, connectionStatus, onConnect, isOwnProfile }) => {
    if (!user) {
        return null;
    }

    
    const avatarUrl = user.profile?.avatar 
        ? user.profile.avatar 
        : 'https://placehold.co/96x96/EFEFEF/AAAAAA&text=No-Photo';
    

    return (
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-md">
            <div className="flex justify-center mb-4">
                <img
                    src={avatarUrl}
                    alt={`${user.firstName}'s profile`}
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                />
            </div>

            <div className="text-center">
                <h3 className="text-2xl font-bold mb-1">{user.firstName} {user.lastName}</h3>
                <p className="text-md text-gray-500 capitalize mb-4">{user.userType}</p>

            
                {!isOwnProfile && connectionStatus && (
                    <button
                        onClick={onConnect}
                        disabled={connectionStatus !== 'connect'}
                        className={`mb-6 w-full py-2 px-4 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${
                            connectionStatus === 'connect' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                            connectionStatus === 'pending' ? 'bg-gray-300 text-gray-600 cursor-not-allowed' :
                            'bg-green-600 text-white cursor-not-allowed'
                        }`}
                    >
                        <UserPlus size={16} />
                        {connectionStatus === 'connect' ? 'Connect' : connectionStatus === 'pending' ? 'Request Sent' : 'Connected'}
                    </button>
                )}
            </div>
            
            <div className="text-left pt-4 border-t border-gray-200 space-y-3">
            
                <div className="text-sm">
                    <strong>Educational History:</strong>
                    {user.profile?.education && user.profile.education.length > 0 && user.profile.education[0].institution ? (
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                            {user.profile.education.map((edu, index) => (
                                <li key={index}>
                                    {edu.degree || 'Degree'} {edu.field ? `in ${edu.field}` : ''} from {edu.institution}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="italic text-gray-500">Not specified</p>
                    )}
                </div>

            
                <div className="text-sm">
                    <strong>Internship:</strong>
                    {user.profile?.internship?.company ? (
                        <p className="text-gray-700">
                            {user.profile.internship.role} at {user.profile.internship.company}
                            {user.profile.internship.duration && ` (${user.profile.internship.duration})`}
                        </p>
                    ) : (
                        <p className="italic text-gray-500">Not specified</p>
                    )}
                </div>

            
                <div className="text-sm">
                    <strong>Current Job:</strong>
                    {user.profile?.currentJob?.company ? (
                        <p className="text-gray-700">
                            {user.profile.currentJob.role} at {user.profile.currentJob.company}
                        </p>
                    ) : (
                        <p className="italic text-gray-500">Not specified</p>
                    )}
                </div>

                
                <div className="text-sm">
                    <strong>Previous Job:</strong>
                    {user.profile?.previousJob?.company ? (
                        <p className="text-gray-700">
                            {user.profile.previousJob.role} at {user.profile.previousJob.company}
                        </p>
                    ) : (
                        <p className="italic text-gray-500">Not specified</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfileCard;