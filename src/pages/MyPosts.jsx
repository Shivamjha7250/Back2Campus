import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from './apiConfig'; // 🔁 Adjust path if needed
import { useSelector } from 'react-redux';
import PostCard from '../components/PostCard'; // ✅ Must support edit/delete if isMyPost = true

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/posts/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching user posts:', err);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setPosts(prev => prev.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleEdit = async (postId, newContent, newLocation) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/posts/${postId}`,
        { content: newContent, location: newLocation },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchUserPosts();
    } catch (err) {
      console.error('Edit failed:', err);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">My Posts</h2>
      {posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        posts.map(post => (
          <PostCard
            key={post._id}
            post={post}
            isMyPost={true}
            onDelete={() => handleDelete(post._id)}
            onEdit={(newContent, newLocation) =>
              handleEdit(post._id, newContent, newLocation)
            }
          />
        ))
      )}
    </div>
  );
};

export default MyPosts;
