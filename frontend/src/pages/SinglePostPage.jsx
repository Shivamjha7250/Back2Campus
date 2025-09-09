import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from './apiConfig';
import { ArrowLeft } from 'lucide-react';
import Post from '../components/PostCard';

const SinglePostPage = () => {
    const { postId } = useParams();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    
    const { user: currentUser } = useOutletContext();

    useEffect(() => {
        const fetchPost = async () => {
            if (!postId) return;

            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${API_BASE_URL}/api/posts/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPost(data);
            } catch (err) {
                setError('Failed to load post. It may have been deleted or you do not have permission to view it.');
                console.error("Fetch Post Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);


    const handlePostUpdate = (updatedPost) => {
        setPost(updatedPost);
    };

    return (
        <div className="container mx-auto max-w-2xl p-4">
            <Link to="/home" className="flex items-center gap-2 text-blue-600 hover:underline mb-4">
                <ArrowLeft size={20} />
                Back to Home
            </Link>

            {loading && (
                <div className="text-center p-10 bg-white rounded-lg shadow-sm border">
                    <p className="text-gray-500">Loading post...</p>
                </div>
            )}

            {error && (
                <div className="text-center p-10 bg-red-50 rounded-lg shadow-sm border border-red-200">
                    <p className="text-red-600 font-semibold">{error}</p>
                </div>
            )}

            {!loading && !error && post && (
                <Post
                    post={post}
                    currentUser={currentUser}
                    onUpdatePost={handlePostUpdate}
                    isReadOnly={false}
                />
            )}
        </div>
    );
};

export default SinglePostPage;
