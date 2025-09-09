import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from './apiConfig'; 
import { useSelector } from 'react-redux';
import PostCard from '../components/PostCard'; 
import { socket } from '../socket';

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const user = useSelector(state => state.auth.user);

  
  const handleUpdatePost = (updatedPost) => {
      console.log("MyPosts component received an update from the server:", updatedPost);
    setPosts(currentPosts =>
      currentPosts.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };
  
  const handlePostDelete = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
  };
  
  useEffect(() => {
    const handleUpdate = (updatedPost) => {
      
      if (updatedPost.user._id === user?._id) {
        handleUpdatePost(updatedPost);
      }
    };
    
    const handleDelete = ({ postId }) => {
      handlePostDelete(postId);
    };

    socket.on('update_post', handleUpdate);
    socket.on('delete_post', handleDelete);

    return () => {
      socket.off('update_post', handleUpdate);
      socket.off('delete_post', handleDelete);
    };
  }, [user]); 

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/posts/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching user posts:', err);
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
            currentUser={user}
            onUpdatePost={handleUpdatePost}
            onPostDelete={handlePostDelete}
          />
        ))
      )}
    </div>
  );
};

export default MyPosts;