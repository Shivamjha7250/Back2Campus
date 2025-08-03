// File: frontend/components/PostCard.jsx
import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Heart, MessageCircle, Share2, MapPin, Send, ThumbsUp } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../pages/apiConfig';

// Naya Sub-component: Reply
const Reply = ({ reply, post, comment, currentUser, onUpdatePost }) => {
    const isReplyOwner = currentUser._id === reply.user._id;
    const isPostOwner = currentUser._id === post.user._id;
    const canDeleteReply = isReplyOwner || isPostOwner;
    const isReplyLiked = reply.likes.includes(currentUser._id);

    const handleLikeReply = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.put(`${API_BASE_URL}/api/posts/${post._id}/comments/${comment._id}/replies/${reply._id}/like`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            onUpdatePost(data);
        } catch (error) { console.error("Failed to like reply:", error); }
    };

    const handleDeleteReply = async () => {
        if (window.confirm("Are you sure you want to delete this reply?")) {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.delete(`${API_BASE_URL}/api/posts/${post._id}/comments/${comment._id}/replies/${reply._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                onUpdatePost(data);
            } catch (error) { console.error("Failed to delete reply:", error); }
        }
    };

    return (
        <div className="flex items-start gap-2 mt-2 ml-5 group">
            <img src={reply.user?.profile?.avatar ? `${API_BASE_URL}${reply.user.profile.avatar}` : 'https://placehold.co/24x24/EFEFEF/AAAAAA&text=A'} alt="replier" className="w-6 h-6 rounded-full" />
            <div className="flex-grow">
                <div className="bg-gray-100 rounded-lg p-2 text-xs">
                    <p className="font-bold">{reply.user?.firstName} {reply.user?.lastName}</p>
                    <p>{reply.text}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <button onClick={handleLikeReply} className={`font-semibold ${isReplyLiked ? 'text-blue-600' : ''}`}>Like</button>
                    <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                    {reply.likes.length > 0 && <span className="flex items-center"><ThumbsUp size={12} className="mr-1 text-blue-500"/>{reply.likes.length}</span>}
                </div>
            </div>
            {canDeleteReply && (
                <button onClick={handleDeleteReply} className="opacity-0 group-hover:opacity-100 text-red-500 p-1 transition-opacity">
                    <Trash2 size={12} />
                </button>
            )}
        </div>
    );
};

// Naya Sub-component: Comment
const Comment = ({ comment, post, currentUser, onUpdatePost }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState('');
    const isCommentLiked = comment.likes.includes(currentUser._id);
    const isCommentOwner = currentUser._id === comment.user._id;
    const isPostOwner = currentUser._id === post.user._id;
    const canDeleteComment = isCommentOwner || isPostOwner;

    const handleLikeComment = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.put(`${API_BASE_URL}/api/posts/${post._id}/comments/${comment._id}/like`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            onUpdatePost(data);
        } catch (error) { console.error("Failed to like comment:", error); }
    };
    
    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${API_BASE_URL}/api/posts/${post._id}/comments/${comment._id}/reply`, 
                { text: replyText }, { headers: { 'Authorization': `Bearer ${token}` } }
            );
            onUpdatePost(data);
            setReplyText('');
            setShowReplyInput(false);
        } catch (error) { console.error("Failed to reply:", error); }
    };
    
    const handleDeleteComment = async () => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.delete(`${API_BASE_URL}/api/posts/${post._id}/comments/${comment._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                onUpdatePost(data);
            } catch (error) { console.error("Failed to delete comment:", error); }
        }
    };

    return (
        <div className="flex items-start gap-2 mt-3 group">
            <img src={comment.user?.profile?.avatar ? `${API_BASE_URL}${comment.user.profile.avatar}` : 'https://placehold.co/32x32/EFEFEF/AAAAAA&text=A'} alt="commenter" className="w-8 h-8 rounded-full" />
            <div className="flex-grow">
                <div className="bg-gray-100 rounded-lg p-2 text-sm">
                    <p className="font-bold">{comment.user?.firstName} {comment.user?.lastName}</p>
                    <p>{comment.text}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <button onClick={handleLikeComment} className={`font-semibold ${isCommentLiked ? 'text-blue-600' : ''}`}>Like</button>
                    <button onClick={() => setShowReplyInput(!showReplyInput)} className="font-semibold">Reply</button>
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    {comment.likes.length > 0 && <span className="flex items-center"><ThumbsUp size={12} className="mr-1 text-blue-500"/>{comment.likes.length}</span>}
                </div>
                {comment.replies && comment.replies.map(reply => (
                    <Reply key={reply._id} reply={reply} post={post} comment={comment} currentUser={currentUser} onUpdatePost={onUpdatePost} />
                ))}
                {showReplyInput && (
                    <form onSubmit={handleReplySubmit} className="flex items-center gap-2 mt-2 ml-5">
                        <img src={currentUser.profile?.avatar ? `${API_BASE_URL}${currentUser.profile.avatar}` : 'https://placehold.co/24x24/EFEFEF/AAAAAA&text=A'} alt="you" className="w-6 h-6 rounded-full" />
                        <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..." className="flex-grow bg-white border rounded-full px-3 py-1 text-xs focus:outline-none"/>
                        <button type="submit" className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><Send size={16} /></button>
                    </form>
                )}
            </div>
            {canDeleteComment && (
                <button onClick={handleDeleteComment} className="opacity-0 group-hover:opacity-100 text-red-500 p-1 transition-opacity">
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    );
};

// Main PostCard Component
const PostCard = ({ post, currentUser, onPostDelete, onUpdatePost }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    const isOwner = currentUser?._id === post.user?._id;
    const isLiked = post.likes.includes(currentUser?._id);

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const handleLike = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.put(`${API_BASE_URL}/api/posts/${post._id}/like`, {}, { headers: { 'Authorization': `Bearer ${token}` } });
            onUpdatePost(data);
        } catch (error) { console.error("Failed to like post:", error); }
    };
    
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${API_BASE_URL}/api/posts/${post._id}/comment`, { text: newComment }, { headers: { 'Authorization': `Bearer ${token}` } });
            onUpdatePost(data);
            setNewComment('');
        } catch (error) { console.error("Failed to add comment:", error); }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_BASE_URL}/api/posts/${post._id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                // Real-time event (delete_post) will update the UI
            } catch (error) { console.error("Failed to delete post:", error); }
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: `Post by ${post.user.firstName}`,
            text: post.content,
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                navigator.clipboard.writeText(shareData.url);
                alert('Link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
            {/* Post Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <img src={post.user?.profile?.avatar ? `${API_BASE_URL}${post.user.profile.avatar}` : 'https://placehold.co/48x48/EFEFEF/AAAAAA&text=A'} alt="author" className="w-12 h-12 rounded-full object-cover" />
                    <div>
                        <p className="font-bold">{post.user?.firstName} {post.user?.lastName}</p>
                        <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                    </div>
                </div>
                {isOwner && (
                    <div className="relative">
                        <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-gray-100"><MoreHorizontal size={20} /></button>
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border z-10">
                                <button className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><Edit size={16} /> Edit</button>
                                <button onClick={handleDelete} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"><Trash2 size={16} /> Delete</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Post Content */}
            <div className="my-4 space-y-4">
                <p>{post.content}</p>
                {post.files && post.files.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                        {post.files.map(file => (
                            <div key={file._id}>
                                {file.fileType === 'image' && <img src={`${API_BASE_URL}${file.url}`} alt="post content" className="rounded-lg object-cover w-full h-auto" />}
                                {file.fileType === 'video' && <video src={`${API_BASE_URL}${file.url}`} controls className="rounded-lg w-full" />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {post.location && (
                 <div className="my-3 p-3 bg-gray-50 rounded-lg text-sm flex items-center gap-2">
                    <MapPin size={16} className="text-gray-500" />
                    <strong>Location:</strong> {post.location}
                </div>
            )}

            {/* Post Actions */}
            <div className="flex justify-around items-center border-t pt-2">
                <button onClick={handleLike} className={`flex items-center gap-2 hover:text-red-500 ${isLiked ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
                    <Heart size={20} /> Like ({post.likes.length})
                </button>
                <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
                    <MessageCircle size={20} /> Comment ({post.comments.length})
                </button>
                <button onClick={handleShare} className="flex items-center gap-2 text-gray-600 hover:text-green-500">
                    <Share2 size={20} /> Share
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 border-t pt-4">
                    <form onSubmit={handleAddComment} className="flex items-center gap-2 mb-4">
                        <img src={currentUser.profile?.avatar ? `${API_BASE_URL}${currentUser.profile.avatar}` : 'https://placehold.co/32x32/EFEFEF/AAAAAA&text=A'} alt="you" className="w-8 h-8 rounded-full" />
                        <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className="flex-grow bg-gray-100 rounded-full px-4 py-2 focus:outline-none" />
                        <button type="submit" className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><Send size={20} /></button>
                    </form>
                    <div className="space-y-3">
                        {post.comments.map(comment => (
                            <Comment key={comment._id} comment={comment} post={post} currentUser={currentUser} onUpdatePost={onUpdatePost} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostCard;
