import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

const DashboardLayout = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndPosts = async () => {
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

        const resPosts = await axios.get(`/api/posts/user/${resUser.data._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(resPosts.data);
      } catch (err) {
        console.error('Auth or posts fetch failed:', err.message);
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPosts();
  }, [navigate]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="flex h-screen overflow-hidden relative">

      {/*  Mobile Hamburger Buttons */}
      <div className="fixed top-4 left-4 md:hidden z-30">
        <button
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="bg-gray-800 text-white p-2 rounded-md"
          aria-label="Toggle Left Sidebar"
        >
          ☰
        </button>
      </div>

      <div className="fixed top-4 right-4 md:hidden z-30">
        <button
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          className="bg-gray-800 text-white p-2 rounded-md"
          aria-label="Toggle Right Sidebar"
        >
          ☰
        </button>
      </div>

      {/*  Left Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 bg-white shadow-lg z-20
          w-64 p-4
          transform transition-transform duration-300 ease-in-out
          ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:shadow-none
          md:flex-shrink-0
        `}
      >
        <LeftSidebar user={user} closeSidebar={() => setLeftSidebarOpen(false)} />
      </div>

      {/*  Main + Right layout (in flex) */}
      <div className="flex flex-1 h-full overflow-hidden">

        {/*  Main Content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <Outlet context={{ user }} />
        </main>

        {/*  Right Sidebar */}
        <div
          className={`
            fixed inset-y-0 right-0 bg-white shadow-lg z-30
            w-105 p-5
            transform transition-transform duration-300 ease-in-out
            ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
            md:translate-x-0 md:static md:shadow-none
            md:flex-shrink-0
            overflow-y-auto
            block
          `}
        >
          {/*  Optional Close Button (Mobile Only) */}
          <button
            onClick={() => setRightSidebarOpen(false)}
            className="md:hidden absolute top-4 right-4 text-gray-600 text-xl"
            aria-label="Close Right Sidebar"
          >
            ✕
          </button>

          <RightSidebar
            user={user}
            posts={posts}
            closeSidebar={() => setRightSidebarOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
