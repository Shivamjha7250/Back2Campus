import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

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
                const { data } = await axios.get('/api/auth/me', {
                    headers: { 
                        'Authorization': `Bearer ${token}` 
                    }
                });
                setUser(data);
            } catch (error) {
                console.error("Failed to fetch user data", error);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>Redirecting to login...</div>;

    return (
        <div className="flex h-screen">
            <LeftSidebar user={user} />
            <main className="flex-1 overflow-auto">
                <Outlet context={{ user }} />
            </main>
            <RightSidebar user={user} />
        </div>
    );
};

export default DashboardLayout;