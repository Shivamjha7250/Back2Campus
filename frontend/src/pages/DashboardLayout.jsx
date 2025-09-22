import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import { socket } from '../socket';
import API_BASE_URL from './apiConfig'; 

const DashboardLayout = () => {
  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handlePhotoUpdate = (newAvatarUrl) => {
    if (!user) return;

    
    const updatedUser = {
      ...user,
      profile: {
        ...user.profile,
        avatar: {
          ...user.profile?.avatar,
          url: newAvatarUrl,
        },
      },
    };

  
    setUser(updatedUser);

    
    localStorage.setItem('profileAvatar', newAvatarUrl);
  };

  const handleUpdatePost = (updatedPost) => {
    setFeedPosts((currentPosts) =>
      currentPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
    setMyPosts((currentPosts) =>
      currentPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  const handleDeletePost = (postId) => {
    setFeedPosts((currentPosts) => currentPosts.filter((p) => p._id !== postId));
    setMyPosts((currentPosts) => currentPosts.filter((p) => p._id !== postId));
  };

  useEffect(() => {
    
    const handleNewPost = (newPost) => {
      setFeedPosts((currentPosts) => [newPost, ...currentPosts]);
      if (newPost.user._id === user?._id) {
        setMyPosts((currentPosts) => [newPost, ...currentPosts]);
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
       
        const { data: userData } = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setUser(userData);
        
     
        if (userData.profile?.avatar?.url) {
          localStorage.setItem('profileAvatar', userData.profile.avatar.url);
        } else {
          localStorage.removeItem('profileAvatar');
        }

        
        const { data: feedData } = await axios.get(`${API_BASE_URL}/api/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFeedPosts(feedData);

       
        const { data: myPostsData } = await axios.get(`${API_BASE_URL}/api/posts/user/${userData._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyPosts(myPostsData);

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

  if (loading) {
    return <div className="p-10 text-center text-xl font-semibold">Loading Campus...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden relative bg-gray-100">
      
      <div className="fixed top-4 left-4 md:hidden z-30">
        <button onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} className="bg-white text-gray-700 p-2 rounded-full shadow-lg">☰</button>
      </div>
      <div className="fixed top-4 right-4 md:hidden z-30">
        <button onClick={() => setRightSidebarOpen(!rightSidebarOpen)} className="bg-white text-gray-700 p-2 rounded-full shadow-lg">👤</button>
      </div>
      <div className={`fixed inset-y-0 left-0 bg-white shadow-lg z-20 w-64 p-4 transform transition-transform duration-300 ease-in-out ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex-shrink-0`}>
        <LeftSidebar user={user} closeSidebar={() => setLeftSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet context={{ user, posts: feedPosts, handleUpdatePost, handleDeletePost }} />
        </main>
        
        <aside className={`fixed inset-y-0 right-0 bg-white z-20 w-80 p-5 transform transition-transform duration-300 ease-in-out ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 md:flex-shrink-0 md:block overflow-y-auto`}>
          <RightSidebar 
            user={user} 
            posts={myPosts} 
            onUpdatePost={handleUpdatePost} 
            onPostDelete={handleDeletePost}
            onPhotoUpdate={handlePhotoUpdate} 
            closeSidebar={() => setRightSidebarOpen(false)}
          />
        </aside>
      </div>
    </div>
  );
};

export default DashboardLayout;