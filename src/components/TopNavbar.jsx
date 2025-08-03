import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bell, MessageSquare, User, LogOut } from 'lucide-react';
import API_BASE_URL from '../pages/apiConfig'; // <-- MISSING IMPORT ADDED

const TopNavbar = ({ user }) => {
    const navItems = [
        { name: 'Home', path: '/home', icon: Home },
        { name: 'Messages', path: '/messages', icon: MessageSquare },
        { name: 'Notifications', path: '/notifications', icon: Bell },
    ];

    return (
        <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-20">
            <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Left Side: Logo and Search */}
                <div className="flex items-center gap-6">
                    <h1 className="text-2xl font-bold text-blue-600">Back2Campus</h1>
                    <div className="relative hidden md:block">
                        <input 
                            type="text"
                            placeholder="Search..."
                            className="bg-gray-100 rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Right Side: Navigation and Profile */}
                <div className="flex items-center gap-4">
                    {navItems.map(item => (
                        <NavLink key={item.name} to={item.path}
                            className={({ isActive }) => `p-2 rounded-full transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <item.icon size={24} />
                        </NavLink>
                    ))}
                    <div className="border-l pl-4 flex items-center gap-3">
                        <img src={`${API_BASE_URL}${user.profile.avatar}`} alt="Profile" className="h-9 w-9 rounded-full"/>
                        <span className="font-semibold hidden md:block">{user.firstName}</span>
                        <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100">
                           <LogOut size={22} />
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default TopNavbar;