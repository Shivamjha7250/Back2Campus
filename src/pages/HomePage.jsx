import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import PostCard from '../components/PostCard';
import API_BASE_URL from './apiConfig';
import axios from 'axios';
import io from 'socket.io-client'; // ✅ Socket.IO client import karein

const socket = io(API_BASE_URL); // ✅ Socket server se connection banayein

const HomePage = () => {
    const { user: currentUser } = useOutletContext();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial posts fetch karein
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                // ✅ Fetch logic yahan add kiya gaya hai
                const { data } = await axios.get(`${API_BASE_URL}/api/posts`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPosts(data);
            } catch (error) {
                console.error("Failed to fetch posts:", error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // ✅ Real-time updates ke liye listeners set karein
    useEffect(() => {
        // Naya post aane par
        socket.on('new_post', (newPost) => {
            setPosts(currentPosts => [newPost, ...currentPosts]);
        });

        // Post update hone par (like, comment, edit)
        socket.on('update_post', (updatedPost) => {
            setPosts(currentPosts => 
                currentPosts.map(p => (p._id === updatedPost._id ? updatedPost : p))
            );
        });

        // Post delete hone par
        socket.on('delete_post', ({ postId }) => {
            setPosts(currentPosts => currentPosts.filter(p => p._id !== postId));
        });

        // Component unmount hone par listeners ko saaf karein
        return () => {
            socket.off('new_post');
            socket.off('update_post');
            socket.off('delete_post');
        };
    }, []);

    if (!currentUser) return <p>Loading user...</p>;

    return (
        <div>
            {loading ? (
                <p>Loading feed...</p>
            ) : Array.isArray(posts) && posts.length > 0 ? (
                posts.map((post) => (
                    <PostCard 
                        key={post._id} 
                        post={post} 
                        currentUser={currentUser}
                        // ✅ Ab onUpdatePost aur onPostDelete ki zarurat nahi
                    />
                ))
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500">No posts available.</p>
                </div>
            )}
        </div>
    );
};

export default HomePage;
