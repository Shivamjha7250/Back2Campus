import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import { socket } from '../socket'; 

const DashboardLayout = () => {
    const [user, setUser] = useState(null);
    const [myPosts, setMyPosts] = useState([]); 
    const [feedPosts, setFeedPosts] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
    const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleUpdatePost = (updatedPost) => {
        
        setFeedPosts(currentPosts =>
            currentPosts.map(p => (p._id === updatedPost._id ? updatedPost : p))
        );
        
        setMyPosts(currentPosts =>
            currentPosts.map(p => (p._id === updatedPost._id ? updatedPost : p))
        );
    };

    const handleDeletePost = (postId) => {
        
        setFeedPosts(currentPosts => currentPosts.filter(p => p._id !== postId));
    
        setMyPosts(currentPosts => currentPosts.filter(p => p._id !== postId));
    };

    useEffect(() => {

        const handleNewPost = (newPost) => {
            setFeedPosts(currentPosts => [newPost, ...currentPosts]);
            if (newPost.user._id === user?._id) {
                setMyPosts(currentPosts => [newPost, ...currentPosts]);
            }
        };

        socket.on('new_post', handleNewPost);
        socket.on('update_post', handleUpdatePost);
        socket.on('delete_post', handleDeletePost);

        return () => {
            socket.off('new_post', handleNewPost);
            socket.off('update_post', handleUpdatePost);
            socket.off('delete_post', handleDeletePost);
        };
    }, [user]); 

    useEffect(() => {
        const fetchInitialData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
        
                const resUser = await axios.get('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(resUser.data);

                
                const resFeedPosts = await axios.get('/api/posts', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFeedPosts(resFeedPosts.data);
                
        
                const resMyPosts = await axios.get(`/api/posts/user/${resUser.data._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMyPosts(resMyPosts.data);

            } catch (err) {
                console.error('Auth or posts fetch failed:', err.message);
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [navigate]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="flex h-screen overflow-hidden relative">
            
            <div className="fixed top-4 left-4 md:hidden z-30">
                <button onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} className="bg-gray-800 text-white p-2 rounded-md">☰</button>
            </div>
            <div className="fixed top-4 right-4 md:hidden z-30">
                <button onClick={() => setRightSidebarOpen(!rightSidebarOpen)} className="bg-gray-800 text-white p-2 rounded-md">☰</button>
            </div>

            
            <div className={`fixed inset-y-0 left-0 bg-white shadow-lg z-20 w-64 p-4 transform transition-transform duration-300 ease-in-out ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:shadow-none md:flex-shrink-0`}>
                <LeftSidebar user={user} closeSidebar={() => setLeftSidebarOpen(false)} />
            </div>

            <div className="flex flex-1 h-full overflow-hidden">
                
                <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    
                    <Outlet context={{ user, posts: feedPosts, handleUpdatePost, handleDeletePost }} />
                </main>

            
                <div className={`fixed inset-y-0 right-0 bg-white shadow-lg z-30 w-105 p-5 transform transition-transform duration-300 ease-in-out ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 md:static md:shadow-none md:flex-shrink-0 overflow-y-auto block`}>
                    <button onClick={() => setRightSidebarOpen(false)} className="md:hidden absolute top-4 right-4 text-gray-600 text-xl">✕</button>
                    
                    <RightSidebar user={user} posts={myPosts} onUpdatePost={handleUpdatePost} onPostDelete={handleDeletePost} />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;