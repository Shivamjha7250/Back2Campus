// File: frontend/pages/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import axios from 'axios';
// import API_BASE_URL from '../pages/apiConfig' // <-- यह लाइन हटा दी गई है
import LeftSidebar from '../pages/LeftSidebar';
import RightSidebar from '../pages/RightSidebar';

const DashboardLayout = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                // 👇 अब API कॉल सीधे /api/auth/me पर जा रहा है,
                // जिससे Vite प्रॉक्सी इसे पोर्ट 5000 पर भेजेगा।
                const { data } = await axios.get('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(data);
            } catch (error) {
                console.error("Failed to fetch user data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (!user) return <div className="flex justify-center items-center h-screen">Redirecting...</div>;

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="flex max-w-screen-2xl mx-auto h-screen">
                <aside className="w-full lg:w-[22%] lg:max-w-[280px] h-full overflow-y-auto">
                    <LeftSidebar user={user} />
                </aside>
                <main className="flex-grow w-full lg:w-[56%] h-full overflow-y-auto p-2 sm:p-4">
                    <Outlet context={{ user }} />
                </main>
                <aside className="hidden lg:block lg:w-[22%] lg:max-w-[340px] h-full overflow-y-auto">
                    <RightSidebar user={user} onPhotoUpdate={() => window.location.reload()} />
                </aside>
            </div>
        </div>
    );
};

export default DashboardLayout;