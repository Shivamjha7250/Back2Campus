import React from 'react';
import ProfilePhotoManager from '../components/ProfilePhotoManager';
import PostCard from '../components/PostCard';

const RightSidebar = ({
    user,
    posts = [],
    onPhotoUpdate,
    closeSidebar,
    onPostDelete,
    onUpdatePost
}) => {
    if (!user) return null;


    const safeOnPhotoUpdate = typeof onPhotoUpdate === 'function' ? onPhotoUpdate : () => {};
    const safeOnPostDelete = typeof onPostDelete === 'function' ? onPostDelete : () => {};
    const safeOnUpdatePost = typeof onUpdatePost === 'function' ? onUpdatePost : () => {};

    const hasExperience = (exp) => exp && exp.company && exp.role;

    return (
        <div className="bg-white p-5 rounded-xl shadow-md flex flex-col space-y-4 h-full relative">
            {closeSidebar && (
                <button 
                    onClick={closeSidebar} 
                    className="md:hidden absolute top-4 right-4 text-gray-600 hover:text-gray-900" 
                    aria-label="Close Sidebar"
                >
                    ✕
                </button>
            )}

            
            <div className="text-center">
                <ProfilePhotoManager user={user} onPhotoUpdate={safeOnPhotoUpdate} />
                <h3 className="text-xl font-bold mt-4">
                    {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-500">{user.userType || 'Alumni'}</p>

                <div className="text-left mt-4 pt-2 border-t border-gray-200 space-y-2">
                    <div className="text-sm">
                        <strong>Educational History:</strong>
                        {user.profile?.education?.length > 0 ? (
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                {user.profile.education.map((edu, index) => (
                                    edu.institution && (
                                        <li key={index}>
                                            {edu.degree || 'Degree'} {edu.field ? `in ${edu.field}` : ''} from {edu.institution}
                                        </li>
                                    )
                                ))}
                            </ul>
                        ) : (
                            <span className="ml-1 italic text-gray-500">Not specified</span>
                        )}
                    </div>

                    <div className="text-sm">
                        <strong>Internship:</strong>
                        {hasExperience(user.profile?.internship) ? (
                            <p className="text-gray-700 pl-2">
                                {user.profile.internship.role} at {user.profile.internship.company} 
                                {user.profile.internship.duration && ` (${user.profile.internship.duration})`}
                            </p>
                        ) : (
                            <span className="ml-1 italic text-gray-500">Not specified</span>
                        )}
                    </div>

                    <div className="text-sm">
                        <strong>Current Job:</strong>
                        {hasExperience(user.profile?.currentJob) ? (
                            <p className="text-gray-700 pl-2">
                                {user.profile.currentJob.role} at {user.profile.currentJob.company}
                            </p>
                        ) : (
                            <span className="ml-1 italic text-gray-500">Not specified</span>
                        )}
                    </div>

                    <div className="text-sm">
                        <strong>Previous Job:</strong>
                        {hasExperience(user.profile?.previousJob) ? (
                            <p className="text-gray-700 pl-2">
                                {user.profile.previousJob.role} at {user.profile.previousJob.company}
                            </p>
                        ) : (
                            <span className="ml-1 italic text-gray-500">Not specified</span>
                        )}
                    </div>
                </div>
            </div>

            
            <div className="flex flex-col flex-grow rounded-xl bg-gray-70 mt-4 overflow-hidden">
                
                <div className="px-2 py-3 border-b border-gray-300">
                    <h4 className="font-bold text-lg">My Posts</h4>
                </div>

                
                <div className="overflow-auto px-2 py-2 space-y-4">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                currentUser={user}
                                onPostDelete={safeOnPostDelete}
                                onUpdatePost={safeOnUpdatePost}
                                compact={false}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-gray-400">
                            You haven't posted anything yet.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RightSidebar;
