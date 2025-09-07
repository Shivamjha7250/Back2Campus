import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ThumbsUp, MessageSquare, Trash2, Lightbulb } from 'lucide-react';
import API_BASE_URL from './apiConfig';

const ContributePage = () => {
  const { user: currentUser } = useOutletContext();
  const [contributions, setContributions] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('idea');
  const [otherDetails, setOtherDetails] = useState('');
  const [commentText, setCommentText] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch all contributions from backend
  const fetchContributions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/contributions`);
      if (!res.ok) throw new Error('Failed to fetch contributions.');
      const data = await res.json();
      setContributions(data);
    } catch (err) {
      console.error(err);
      setError('Could not load contributions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  // Submit new contribution
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !title.trim() ||
      (!description.trim() && category !== 'other') ||
      (category === 'other' && !otherDetails.trim())
    ) {
      setError('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/contributions/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser._id,
          title,
          description: category === 'other' ? otherDetails : description,
          category,
        }),
      });
      const newContribution = await res.json();
      if (!res.ok) throw new Error(newContribution.message || 'Submission failed.');
      setContributions([newContribution, ...contributions]);
      // Reset form fields
      setTitle('');
      setDescription('');
      setOtherDetails('');
      setCategory('idea');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle upvote/un-upvote
  const handleUpvote = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/contributions/${id}/upvote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser._id }),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error('Upvote failed.');
      setContributions(contributions.map((c) => (c._id === id ? updated : c)));
    } catch (err) {
      console.error(err);
    }
  };

  // Handle delete post - only allowed for post owner
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/contributions/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser._id }),
      });
      if (!res.ok) throw new Error('Deletion failed.');
      setContributions(contributions.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Add comment to contribution
  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/contributions/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser._id, text: commentText }),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error('Comment failed.');
      setContributions(contributions.map((c) => (c._id === postId ? updated : c)));
      setCommentText('');
      setActiveCommentPostId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Contribution Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow sticky top-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="text-yellow-500" />
            Share Your Ideas
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded"
            />
            {category !== 'other' ? (
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border p-2 rounded"
                rows={4}
              />
            ) : (
              <textarea
                placeholder="Please specify details for 'Other'"
                value={otherDetails}
                onChange={(e) => setOtherDetails(e.target.value)}
                className="w-full border p-2 rounded"
                rows={4}
              />
            )}
            <select
              className="w-full border p-2 rounded"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="idea">Idea</option>
              <option value="event">Event</option>
              <option value="book-donation">Book Donation</option>
              <option value="lecture">Lecture</option>
              <option value="other">Other</option>
            </select>
            {error && <p className="text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>

      {/* Contributions List */}
      <div className="lg:col-span-2">
        <h2 className="text-xl font-bold mb-4">Community Suggestions</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {contributions.length === 0 && <p>No posts yet.</p>}
            {contributions.map((post) => (
              <div
                key={post._id}
                className="p-4 border rounded shadow bg-white"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  {post.user._id === currentUser._id && (
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Post"
                    >
                      <Trash2 />
                    </button>
                  )}
                </div>
                <p>{post.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Category: {post.category}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <button
                    onClick={() => handleUpvote(post._id)}
                    className={`flex items-center gap-1 ${
                      post.upvotes && post.upvotes.includes(currentUser._id)
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <ThumbsUp />
                    {Array.isArray(post.upvotes) ? post.upvotes.length : 0}
                  </button>
                  <button
                    onClick={() =>
                      setActiveCommentPostId(
                        post._id === activeCommentPostId ? null : post._id
                      )
                    }
                    className="flex items-center gap-1 text-gray-600 hover:text-green-600"
                  >
                    <MessageSquare />
                    {Array.isArray(post.comments) ? post.comments.length : 0}
                  </button>
                </div>

                {/* Comments Section */}
                {activeCommentPostId === post._id && (
                  <div className="mt-3">
                    <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded">
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((c) => (
                          <div
                            key={c._id || c.createdAt}
                            className="text-sm border-b py-1"
                          >
                            <strong>{c.user?.firstName || 'User'}:</strong>{' '}
                            {c.text}
                            {/* You can extend here for reply feature */}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No comments yet.</p>
                      )}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        className="flex-1 border p-2 rounded"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                      <button
                        onClick={() => handleAddComment(post._id)}
                        className="bg-green-600 text-white px-3 rounded"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContributePage;
