// File: frontend/components/LeftSidebar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../pages/apiConfig';
import { Home, Search, Heart, MessageSquare, Bell, UserPlus, Users, Settings, LogOut, PlusCircle } from 'lucide-react';

const LeftSidebar = ({ user }) => {
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navItems = [
        { name: 'Home', path: '/home', icon: Home },
        { name: 'Create Post', path: '/create-post', icon: PlusCircle },
        { name: 'Find Users', path: '/find-users', icon: Search },
        { name: 'Contribute', path: '/contribute', icon: Heart },
        { name: 'Chat', path: '/chat', icon: MessageSquare },
        { name: 'Notification', path: '/notification', icon: Bell },
        { name: 'Requested', path: '/requested', icon: UserPlus },
        { name: 'My Connection', path: '/my-connection', icon: Users },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    if (!user) return null;

    return (
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="px-2 sm:px-4 mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-blue-600">Back2Campus</h1>
            </div>
            <nav className="flex-grow space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `flex items-center justify-between gap-4 px-2 sm:px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <div className="flex items-center gap-4">
                            <item.icon size={22} />
                            <span className="hidden sm:inline">{item.name}</span>
                        </div>
                        {/* ✅ Unread count badge yahan se hata diya gaya hai */}
                    </NavLink>
                ))}
            </nav>
            <div className="mt-6 border-t pt-4">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                        <img src={user.profile?.avatar ? `${API_BASE_URL}${user.profile.avatar}` : 'https://placehold.co/40x40/EFEFEF/AAAAAA&text=A'} alt="Avatar" className="h-10 w-10 rounded-full object-cover" />
                        <div className="hidden sm:block">
                            <p className="font-bold text-sm">{user.firstName} {user.lastName}</p>
                        </div>
                    </div>
                    <button onClick={() => setShowLogoutConfirm(true)} className="p-2 text-gray-500 hover:text-red-600 rounded-full" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
            {/* ... (Logout Confirmation Modal) */}
        </div>
    );
};

export default LeftSidebar;
