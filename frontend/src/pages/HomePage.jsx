import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import PostCard from '../components/PostCard';
import API_BASE_URL from './apiConfig';
import axios from 'axios';
import { socket } from '../socket';

const HomePage = () => {
    const { user: initialUser, refetchUser } = useOutletContext();
    const [currentUser, setCurrentUser] = useState(initialUser);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setCurrentUser(initialUser);
    }, [initialUser]);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
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

    useEffect(() => {
        const handleNewPost = (newPost) => setPosts(currentPosts => [newPost, ...currentPosts]);
        const handleUpdatePost = (updatedPost) =>
            setPosts(currentPosts => currentPosts.map(p => (p._id === updatedPost._id ? updatedPost : p)));
        const handleDeletePost = ({ postId }) =>
            setPosts(currentPosts => currentPosts.filter(p => p._id !== postId));

        socket.on('new_post', handleNewPost);
        socket.on('update_post', handleUpdatePost);
        socket.on('delete_post', handleDeletePost);

        return () => {
            socket.off('new_post', handleNewPost);
            socket.off('update_post', handleUpdatePost);
            socket.off('delete_post', handleDeletePost);
        };
    }, []);

    const updatePostInState = (updatedPost) => {
        setPosts(prevPosts => prevPosts.map(post => post._id === updatedPost._id ? updatedPost : post));
    };

    const deletePostFromState = (postId) => {
        setPosts(prevPosts => prevPosts.filter(p => p._id !== postId));
    };

    const handleConnectionUpdate = (sentToUserId) => {
        setCurrentUser(prevUser => ({
            ...prevUser,
            sentRequests: [...prevUser.sentRequests, sentToUserId]
        }));
        if (refetchUser) {
            refetchUser();
        }
    };

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
                        onUpdatePost={updatePostInState}
                        onPostDelete={deletePostFromState}
                        onConnectionUpdate={handleConnectionUpdate}
                    />
                ))
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500">No posts available. Be the first one to post!</p>
                </div>
            )}
        </div>
    );
};

export default HomePage;
