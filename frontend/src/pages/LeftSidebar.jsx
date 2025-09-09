import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../pages/apiConfig';
import { socket } from '../socket';
import {
  Home, Search, Heart, MessageSquare, Bell,
  UserPlus, Users, Settings, LogOut, PlusCircle
} from 'lucide-react';

const LeftSidebar = ({ user, closeSidebar }) => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  
  const [newChat, setNewChat] = useState(localStorage.getItem('newChat') === 'true');
  const [newNotification, setNewNotification] = useState(localStorage.getItem('newNotification') === 'true');
  const [newRequest, setNewRequest] = useState(localStorage.getItem('newRequest') === 'true');

  
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleNewChat = () => {
      console.log(" New Chat Message");
      setNewChat(true);
      localStorage.setItem('newChat', 'true');
    };

    const handleNewNotification = () => {
      console.log(" New Notification");
      setNewNotification(true);
      localStorage.setItem('newNotification', 'true');
    };

    const handleNewRequest = () => {
      console.log(" New Request Received");
      setNewRequest(true);
      localStorage.setItem('newRequest', 'true');
    };

    
    socket.on('new_chat', handleNewChat);
    socket.on('new_notification', handleNewNotification);
    socket.on('new_request', handleNewRequest);

    
    return () => {
      socket.off('new_chat', handleNewChat);
      socket.off('new_notification', handleNewNotification);
      socket.off('new_request', handleNewRequest);
    };
  }, []);

  
  useEffect(() => {
    const syncNotificationFlags = (event) => {
      if (!event) return;
      if (event.key === 'newChat') setNewChat(event.newValue === 'true');
      if (event.key === 'newNotification') setNewNotification(event.newValue === 'true');
      if (event.key === 'newRequest') setNewRequest(event.newValue === 'true');
    };

    window.addEventListener('storage', syncNotificationFlags);
    return () => window.removeEventListener('storage', syncNotificationFlags);
  }, []);

  
  const handleNavClick = (itemName) => {
    if (itemName === 'Chat') {
      setNewChat(false);
      localStorage.setItem('newChat', 'false');
    }
    if (itemName === 'Notification') {
      setNewNotification(false);
      localStorage.setItem('newNotification', 'false');
    }
    if (itemName === 'Requested') {
      setNewRequest(false);
      localStorage.setItem('newRequest', 'false');
    }
    if (closeSidebar) closeSidebar();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    ['newChat', 'newNotification', 'newRequest'].forEach(key => {
      localStorage.setItem(key, 'false');
    });
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
    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full relative">
      {closeSidebar && (
        <button
          onClick={closeSidebar}
          className="md:hidden absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          aria-label="Close Sidebar"
        >
          ✕
        </button>
      )}

      <div className="px-2 sm:px-4 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-600">Back2Campus</h1>
      </div>

      <nav className="flex-grow space-y-2 overflow-visible">
        {navItems.map((item) => {
          const showDot =
            (item.name === 'Chat' && newChat) ||
            (item.name === 'Notification' && newNotification) ||
            (item.name === 'Requested' && newRequest);

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => handleNavClick(item.name)}
              className={({ isActive }) =>
                `relative flex items-center justify-between px-3 py-3 rounded-lg font-medium transition-colors
                ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              <div className="flex items-center gap-4 relative w-full">
                <div className="relative">
                  <item.icon size={22} />

                  {showDot && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse z-10 ring-2 ring-white" />
                  )}
                </div>
                <span>{item.name}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-6 border-t pt-4">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <img
              src={
                user.profile?.avatar
                  ? `${API_BASE_URL}${user.profile.avatar}`
                  : 'https://placehold.co/40x40/EFEFEF/AAAAAA&text=A'
              }
              alt="Avatar"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <p className="font-bold text-sm">
                {user.firstName} {user.lastName}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 text-gray-500 hover:text-red-600 rounded-full"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="absolute bottom-4 left-4 bg-white border border-gray-300 shadow-lg rounded-lg p-4 z-50 w-64">
          <p className="text-sm font-semibold text-gray-800 mb-3">Are you sure you want to logout?</p>
          <div className="flex justify-between">
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white text-sm px-3 py-1.5 rounded hover:bg-red-700"
            >
              Logout
            </button>
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="bg-gray-200 text-gray-800 text-sm px-3 py-1.5 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftSidebar;
