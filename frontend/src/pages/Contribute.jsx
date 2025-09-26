import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { ThumbsUp, MessageSquare, Trash2, Lightbulb, User, Send, CornerDownRight, X } from 'lucide-react';

const LikersModal = ({ users, onClose, isLoading }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md relative">
            <h3 className="text-xl font-bold mb-4">Likes</h3>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X size={24} />
            </button>
            {isLoading ? (
                <p className="text-gray-500">Loading likers...</p>
            ) : (
                <div className="max-h-60 overflow-y-auto space-y-2">
                    {users.length === 0 ? (
                        <p>No likers found.</p>
                    ) : (
                        users.map(user => (
                            <div key={user._id} className="flex items-center gap-3 p-2 border-b last:border-b-0">
                                <img src={getAvatarUrl(user)} alt={user.firstName} className="w-8 h-8 rounded-full object-cover" />
                                <Link to={`/profile/${user._id}`} className="font-medium text-blue-600 hover:underline">
                                    {user.firstName} {user.lastName}
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            )}
            <button onClick={onClose} className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Close</button>
        </div>
    </div>
);
const API_BASE_URL = 'http://localhost:5000';

import axios from 'axios';

const getAvatarUrl = (user) => {
    return (user && user.profile && user.profile.avatar && user.profile.avatar.url)
        ? user.profile.avatar.url
        : 'https://placehold.co/28x28';
};

const CommentItem = ({
    comment,
    postId,
    currentUser,
    getAvatarUrl,
    handleInteraction,
    handleReplySubmit,
    handleDeleteComment,
    replyText,
    setReplyText,
    activeReplyCommentId,
    setActiveReplyCommentId
}) => {

    const isReplyInputActive = activeReplyCommentId === comment._id;
    const isCurrentUserComment = comment.user._id === currentUser._id;

    const RepliesDisplay = ({ replies }) => (
        <div className="pl-6 mt-3 space-y-2 border-l-2 border-gray-200">
            {replies.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((reply) => {
                const isCurrentUserReply = reply.user._id === currentUser._id;
                return (
                    <div
                        key={reply._id || reply.createdAt}
                        className="text-xs flex items-start gap-2 bg-white p-2 rounded-lg shadow-sm"
                    >
                        <Link to={`/profile/${reply.user._id}`}>
                            <img
                                src={getAvatarUrl(reply.user)}
                                alt={reply.user?.firstName || 'User'}
                                className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5"
                            />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <Link
                                    to={`/profile/${reply.user._id}`}
                                    className="font-bold hover:underline text-gray-800 mr-1 truncate"
                                >
                                    {reply.user?.firstName || 'User'}
                                </Link>
                                {isCurrentUserReply && (
                                    <button
                                        onClick={() => handleDeleteComment(postId, comment._id, reply._id)}
                                        className="text-red-500 hover:text-red-700 p-1 transition"
                                        title="Delete Reply"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                            <span className="text-gray-600 whitespace-pre-wrap block">{reply.text}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    );

    return (
        <div className="text-sm space-y-2">
            <div
                key={comment._id || comment.createdAt}
                className={`flex items-start gap-2 p-3 rounded-lg ${isCurrentUserComment ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'}`}
            >
                <Link to={`/profile/${comment.user._id}`}>
                    <img
                        src={getAvatarUrl(comment.user)}
                        alt={comment.user?.firstName || 'User'}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                    />
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <Link
                            to={`/profile/${comment.user._id}`}
                            className="font-bold hover:underline text-gray-800 mr-1 truncate"
                        >
                            {comment.user?.firstName || 'User'} {comment.user?.lastName || ''}
                        </Link>
                        {isCurrentUserComment && (
                            <button
                                onClick={() => handleDeleteComment(postId, comment._id, null)}
                                className="text-red-500 hover:text-red-700 p-1 transition"
                                title="Delete Comment"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                    <span className="text-gray-600 whitespace-pre-wrap block">{comment.text}</span>

                    <div className="flex mt-1">
                        <button
                            onClick={() => {
                                if (!handleInteraction()) return;
                                setActiveReplyCommentId(isReplyInputActive ? null : comment._id);
                                setReplyText('');
                            }}
                            className="flex items-center text-xs font-medium text-blue-500 hover:text-blue-700 transition p-1 rounded hover:bg-blue-100"
                        >
                            <CornerDownRight size={14} className="mr-1" />
                            {isReplyInputActive ? 'Cancel Reply' : 'Reply'}
                        </button>
                    </div>
                </div>
            </div>
            {isReplyInputActive && (
                <div className="pl-6 flex items-center gap-2 mb-2">
                    <img
                        src={getAvatarUrl(currentUser)}
                        alt="You"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <input
                        type="text"
                        placeholder={`Write a Reply to ${comment.user?.firstName || 'User'}...`}
                        className="flex-1 border border-gray-300 p-2 rounded-full px-4 text-sm"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleReplySubmit(postId, comment._id);
                            }
                        }}
                    />
                    <button
                        onClick={() => handleReplySubmit(postId, comment._id)}
                        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition shadow"
                        disabled={!replyText.trim()}
                    >
                        <Send size={16} />
                    </button>
                </div>
            )}
            {comment.replies && comment.replies.length > 0 && (
                <RepliesDisplay replies={comment.replies} />
            )}
        </div>
    );
};

const ContributePage = () => {
    const { user: currentUser } = useOutletContext();
    const navigate = useNavigate();
    const [contributions, setContributions] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('idea');
    const [otherDetails, setOtherDetails] = useState('');
    const [commentText, setCommentText] = useState('');
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [likersList, setLikersList] = useState(null);
    const [isFetchingLikers, setIsFetchingLikers] = useState(false);

    const handleInteraction = () => {
        if (!currentUser) {
            console.warn('Please log in to interact.');
            return false;
        }
        return true;
    };

    const updatePostInState = (updatedPost) => {
        setContributions(prev => prev.map(c =>
            c._id === updatedPost._id ? updatedPost : c
        ));
    };

    const confirmDelete = () => {
        console.log('--- Custom Delete Confirmation UI is needed ---');
        return true;
    }

    const fetchContributions = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_BASE_URL}/api/contributions`);
            setContributions(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load contributions.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || (!description.trim() && category !== 'other') || (category === 'other' && !otherDetails.trim())) {
            setError('Please fill all required fields.');
            return;
        }
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const { data: newContribution } = await axios.post(
                `${API_BASE_URL}/api/contributions/create`,
                {
                    userId: currentUser._id,
                    title,
                    description: category === 'other' ? otherDetails : description,
                    category,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setContributions([newContribution, ...contributions]);
            setTitle('');
            setDescription('');
            setOtherDetails('');
            setCategory('idea');
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed.');
        } finally {
            setSubmitting(false);
        }
    };


    const handleLike = async (id) => {
        if (!handleInteraction()) return;
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.put(
                `${API_BASE_URL}/api/contributions/${id}/upvote`,
                { userId: currentUser._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            updatePostInState(data);
        } catch (err) {
            console.error('Like failed:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!handleInteraction() || !confirmDelete()) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${API_BASE_URL}/api/contributions/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { userId: currentUser._id }
                }
            );
            setContributions(prev => prev.filter(c => c._id !== id));
        } catch (err) {
            console.error('Deletion failed:', err);
        }
    };

    const handleCommentSubmit = async (postId) => {
        if (!commentText.trim() || !handleInteraction()) return;
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(
                `${API_BASE_URL}/api/contributions/${postId}/comments`,
                { userId: currentUser._id, text: commentText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            updatePostInState(data);
            setCommentText('');
            setActiveCommentPostId(null);
        } catch (err) {
            console.error('Comment failed:', err);
        }
    };

    const handleReplySubmit = async (postId, commentId) => {
        if (!replyText.trim() || !handleInteraction()) return;

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(
                `${API_BASE_URL}/api/contributions/${postId}/comments/${commentId}/replies`,
                { userId: currentUser._id, text: replyText },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            updatePostInState(data);
            setReplyText('');
            setActiveReplyCommentId(null);
        } catch (err) {
            console.error('Reply failed:', err);
        }
    };

    const handleDeleteComment = async (postId, commentId, replyId) => {
        if (!handleInteraction() || !confirmDelete()) return;

        try {
            const token = localStorage.getItem('token');
            let endpoint;
            let deletionType = replyId ? 'Reply' : 'Comment';

            if (replyId) {
                endpoint = `${API_BASE_URL}/api/contributions/${postId}/comments/${commentId}/replies/${replyId}`;
            } else {
                endpoint = `${API_BASE_URL}/api/contributions/${postId}/comments/${commentId}`;
            }

            console.log(`Deleting ${deletionType} at endpoint: ${endpoint}`);

            const { data } = await axios.delete(
                endpoint,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { userId: currentUser._id }
                }
            );

            updatePostInState(data);

            if (commentId === activeReplyCommentId) {
                setActiveReplyCommentId(null);
                setReplyText('');
            }
            if (!replyId && postId === activeCommentPostId) {
                setActiveCommentPostId(null);
                setCommentText('');
            }

            console.log(`${deletionType} deleted successfully.`);
        } catch (err) {
            console.error(`${deletionType} deletion failed:`, err);
        }
    };

    const handleShowLikers = useCallback(async (postId) => {
        if (!handleInteraction()) return;
        try {
            setIsFetchingLikers(true);
            setLikersList([]);
            const token = localStorage.getItem('token');
            const { data } = await axios.get(
                `${API_BASE_URL}/api/contributions/${postId}/likers`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Likers fetched from API:", data);

            setLikersList(data);
        } catch (error) {
            console.error("Error fetching likers:", error);
            setLikersList([]);
        } finally {
            setIsFetchingLikers(false);
        }
    }, [currentUser]);

    const handleCloseLikersModal = () => {
        setLikersList(null);
    };

    useEffect(() => {
        fetchContributions();
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-inter min-h-screen bg-gray-50 p-4">
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-lg sticky top-4">
                    <h2 className="text-2xl font-extrabold mb-5 text-gray-800 flex items-center gap-2">
                        <Lightbulb className="text-yellow-500 w-6 h-6" />
                        Share Your Ideas
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" placeholder="Contribution Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150" required />

                        <select className="w-full border border-gray-300 p-3 rounded-lg bg-white appearance-none" value={category} onChange={(e) => setCategory(e.target.value)} required>
                            <option value="idea">Idea</option>
                            <option value="event">Event Proposal</option>
                            <option value="book-donation">Book/Resource Donation</option>
                            <option value="lecture">Lecture Request</option>
                            <option value="other">Other</option>
                        </select>

                        {category !== 'other' ? (
                            <textarea placeholder="Detailed Description..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150" rows={4} required />
                        ) : (
                            <textarea placeholder="Please provide details for 'Other'" value={otherDetails} onChange={(e) => setOtherDetails(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150" rows={4} required />
                        )}

                        {error && <p className="text-red-500 bg-red-100 p-2 rounded-lg text-sm">{error}</p>}

                        <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md">
                            {submitting ? 'Submitting...' : 'Submit Contribution'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2">
                <h2 className="text-2xl font-extrabold mb-5 text-gray-800">Community Suggestions</h2>
                {loading ? (
                    <div className="flex justify-center items-center h-40 bg-white rounded-xl shadow-lg">
                        <p className="text-lg text-gray-500">Loading Contributions...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {contributions.length === 0 && <p className="text-gray-600 p-4 bg-white rounded-xl shadow-lg">No posts yet. Be the first to contribute!</p>}
                        {contributions.map((post) => (
                            <div key={post._id} className="p-5 border rounded-xl shadow-lg bg-white transition duration-300 hover:shadow-xl">

                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-bold text-gray-800">{post.title}</h3>
                                    {post.user._id === currentUser._id && (
                                        <button onClick={() => handleDelete(post._id)} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition" title="Delete Post">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center text-sm text-gray-600 mb-3">
                                    <User size={14} className="mr-1 text-blue-500" />
                                    Posted By:
                                    <Link to={`/profile/${post.user._id}`} className="font-medium ml-1 text-blue-600 hover:text-blue-800 hover:underline transition">
                                        {post.user.firstName || 'User'} {post.user.lastName || ''}
                                    </Link>
                                </div>

                                <p className="text-gray-700 mb-3 whitespace-pre-wrap">{post.description}</p>

                                <p className="text-xs font-semibold text-gray-500 mt-2 bg-gray-100 p-2 rounded inline-block">
                                    Category: {post.category}
                                </p>

                                <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100">

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            className={`flex items-center gap-1 p-2 rounded-full transition ${
                                                post.upvotes && post.upvotes.includes(currentUser._id)
                                                    ? 'text-red-600 bg-red-100'
                                                    : 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <ThumbsUp size={18} />
                                            <span className="font-medium">Like</span>
                                        </button>

                                        {Array.isArray(post.upvotes) && post.upvotes.length > 0 && (
                                            <button
                                                onClick={() => handleShowLikers(post._id)}
                                                className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer ml-1"
                                            >
                                                {post.upvotes.length}
                                            </button>
                                        )}
                                    </div>


                                    <button
                                        onClick={() => {
                                            setActiveCommentPostId(
                                                post._id === activeCommentPostId ? null : post._id
                                            );
                                            setActiveReplyCommentId(null);
                                            setReplyText('');
                                        }}
                                        className="flex items-center gap-1 p-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-100 transition"
                                    >
                                        <MessageSquare size={18} />
                                        <span className="font-medium">Comment ({Array.isArray(post.comments) ? post.comments.length : 0})</span>
                                    </button>
                                </div>

                                {activeCommentPostId === post._id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">

                                        <div className="flex items-center gap-2 mb-4">
                                            <img
                                                src={getAvatarUrl(currentUser)}
                                                alt="You"
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Write a Comment..."
                                                className="flex-1 border border-gray-300 p-2 rounded-full px-4"
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleCommentSubmit(post._id);
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={() => handleCommentSubmit(post._id)}
                                                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow"
                                                disabled={!commentText.trim()}
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>

                                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                            {post.comments && post.comments.length > 0 ? (
                                                post.comments
                                                    .slice()
                                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                    .map((c) => (
                                                        <CommentItem
                                                            key={c._id || c.createdAt}
                                                            comment={c}
                                                            postId={post._id}
                                                            currentUser={currentUser}
                                                            getAvatarUrl={getAvatarUrl}
                                                            handleInteraction={handleInteraction}
                                                            handleReplySubmit={handleReplySubmit}
                                                            handleDeleteComment={handleDeleteComment}
                                                            replyText={replyText}
                                                            setReplyText={setReplyText}
                                                            activeReplyCommentId={activeReplyCommentId}
                                                            setActiveReplyCommentId={setActiveReplyCommentId}
                                                        />
                                                    ))
                                            ) : (
                                                <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {likersList !== null && (
                <LikersModal
                    users={likersList}
                    onClose={handleCloseLikersModal}
                    isLoading={isFetchingLikers}
                />
            )}
        </div>
    );
};

export default ContributePage;