import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpVerificationPage from './pages/OtpVerification';
import DashboardLayout from './pages/DashboardLayout';
import HomePage from './pages/HomePage';
import CreatePostPage from './pages/CreatePostPage';
// ✅ Naye pages import karein
import FindUsersPage from './pages/FindUsers';
import RequestedPage from './pages/Requested';
import NotificationPage from './pages/Notification';
import MyConnectionPage from './pages/MyConnection';
import ChatPage from './pages/Chat';
import SettingsPage from './pages/Settings';

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/otp-verification" element={<OtpVerificationPage />} />
                
                {/* Protected Routes */}
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
                    {/* ✅ Naye pages ke liye routes */}
                    <Route path="find-users" element={<FindUsersPage />} />
                    <Route path="requested" element={<RequestedPage />} />
                    <Route path="notification" element={<NotificationPage />} />
                    <Route path="my-connection" element={<MyConnectionPage />} />
                    <Route path="chat" element={<ChatPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
