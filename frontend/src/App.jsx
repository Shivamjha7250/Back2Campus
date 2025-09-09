import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpVerificationPage from './pages/OtpVerification';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';

import DashboardLayout from './pages/DashboardLayout';
import HomePage from './pages/HomePage';
import CreatePostPage from './pages/CreatePostPage';
import FindUsersPage from './pages/FindUsers';
import RequestedPage from './pages/Requested';
import NotificationPage from './pages/Notification';
import MyConnectionPage from './pages/MyConnection';
import ChatPage from './pages/Chat';
import ContributePage from './pages/Contribute';
import SettingsPage from './pages/Settings';
import UserProfilePage from './pages/UserProfilePage';
import SinglePostPage from './pages/SinglePostPage'; 

import { socket } from './socket';


const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  
  const [token, setToken] = useState(localStorage.getItem('token'));

  
  useEffect(() => {
    
    if (token) {
      
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?._id) {
        
        socket.auth = { userId: user._id };
        socket.connect();

        socket.on('connect', () => {
          console.log(` Socket connected with ID: ${socket.id} for user: ${user._id}`);
          
          socket.emit('join', user._id);
        });

        socket.on('disconnect', () => {
          console.log('🔌 Socket disconnected.');
        });
      }
    }

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [token]);

  
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };

    
    window.addEventListener('storage', handleStorageChange);

    const handleLogin = () => setToken(localStorage.getItem('token'));
    window.addEventListener('login', handleLogin);
    window.addEventListener('logout', handleLogin);


    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('login', handleLogin);
      window.removeEventListener('logout', handleLogin);
    };
  }, []);


  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/otp-verification" element={<OtpVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="create-post" element={<CreatePostPage />} />
          <Route path="find-users" element={<FindUsersPage />} />
          <Route path="requested" element={<RequestedPage />} />
          <Route path="notification" element={<NotificationPage />} />
          <Route path="my-connection" element={<MyConnectionPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="contribute" element={<ContributePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile/:userId" element={<UserProfilePage />} />
          <Route path="/post/:postId" element={<SinglePostPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
