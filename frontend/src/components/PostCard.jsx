import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Heart, MessageCircle, Share2, MapPin, Send } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../pages/apiConfig';
import { Link } from 'react-router-dom';

const isEditable = (createdAt) => {
  const now = new Date();
  const postTime = new Date(createdAt);
  const diffInHours = (now - postTime) / (1000 * 60 * 60);
  return diffInHours < 2; 
};

const Comment = ({ comment, currentUser, postOwnerId, onReplySubmit, onDeleteComment }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReplySubmit(comment._id, replyText);
    setReplyText('');
    setShowReply(false);
  };

  // Determine if current user can delete this comment
  const canDeleteComment = currentUser?._id === postOwnerId || currentUser?._id === comment.user?._id;

  return (
    <div className="p-2 border rounded bg-gray-50 relative">
      <Link to={`/profile/${comment.user?._id}`} className="flex items-center gap-2 mb-1">
        <img
          src={comment.user?.profile?.avatar ? `${API_BASE_URL}${comment.user.profile.avatar}` : 'https://placehold.co/32x32'}
          alt={`${comment.user?.firstName} ${comment.user?.lastName}`}
          className="w-8 h-8 rounded-full object-cover cursor-pointer"
        />
        <p className="font-semibold cursor-pointer hover:underline">{comment.user?.firstName} {comment.user?.lastName}</p>
      </Link>

      <p>{comment.text}</p>

      <button
        onClick={() => setShowReply(!showReply)}
        className="text-sm text-blue-500 mt-1 hover:underline"
      >
        Reply
      </button>

      {canDeleteComment && (
        <button
          onClick={() => onDeleteComment(comment._id)}
          className="absolute top-2 right-2 text-red-600 hover:text-red-800"
          title="Delete Comment"
        >
          <Trash2 size={16} />
        </button>
      )}

      {showReply && (
        <form onSubmit={handleReply} className="mt-2 flex items-center gap-2">
          <input
            type="text"
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 bg-white border rounded-full px-3 py-1 text-sm"
          />
          <button type="submit" className="text-blue-500"><Send size={18} /></button>
        </form>
      )}

      {comment.replies?.length > 0 && (
        <div className="ml-4 mt-2 space-y-2">
          {comment.replies.map((reply) => {
            const canDeleteReply = currentUser?._id === postOwnerId || currentUser?._id === reply.user?._id;
            return (
              <div key={reply._id} className="text-sm bg-gray-100 p-2 rounded flex items-center gap-2 relative">
                <Link to={`/profile/${reply.user?._id}`} className="flex items-center gap-2">
                  <img
                    src={reply.user?.profile?.avatar ? `${API_BASE_URL}${reply.user.profile.avatar}` : 'https://placehold.co/24x24'}
                    alt={`${reply.user?.firstName} ${reply.user?.lastName}`}
                    className="w-6 h-6 rounded-full object-cover cursor-pointer"
                  />
                  <p className="font-semibold cursor-pointer hover:underline">{reply.user?.firstName} {reply.user?.lastName}</p>
                </Link>
                <p>{reply.text}</p>

                {canDeleteReply && (
                  <button
                    onClick={() => onDeleteComment(reply._id, comment._id)} 
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                    title="Delete Reply"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const PostCard = ({ post, currentUser, onPostDelete, onUpdatePost }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);

  const isOwner = currentUser?._id === post.user?._id;
  const isLiked = post.likes.includes(currentUser?._id);
  
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(
        `${API_BASE_URL}/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdatePost(data);
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API_BASE_URL}/api/posts/${post._id}/comment`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdatePost(data);
      setNewComment('');
      setShowComments(true);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleReplySubmit = async (commentId, replyText) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API_BASE_URL}/api/posts/${post._id}/comments/${commentId}/reply`,
        { text: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdatePost(data);
    } catch (error) {
      console.error("Failed to reply to comment:", error);
    }
  };

  // For replies, commentId (parent) will be passed as well.
  const handleDeleteComment = async (commentOrReplyId, parentCommentId = null) => {
    const confirmMsg = parentCommentId
      ? "Are you sure you want to delete this reply?"
      : "Are you sure you want to delete this comment?";

    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');
      let url = '';
      if (parentCommentId) {
        // Delete reply
        url = `${API_BASE_URL}/api/posts/${post._id}/comments/${parentCommentId}/reply/${commentOrReplyId}`;
      } else {
        // Delete comment
        url = `${API_BASE_URL}/api/posts/${post._id}/comments/${commentOrReplyId}`;
      }

      const { data } = await axios.delete(
        url,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdatePost(data);
    } catch (error) {
      console.error("Failed to delete comment/reply:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${API_BASE_URL}/api/posts/${post._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (onPostDelete) onPostDelete(post._id);
      } catch (error) {
        console.error("Failed to delete post:", error);
      }
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
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Updated handleEditClick with 2 hour restriction
  const handleEditClick = () => {
    if (!isEditable(post.createdAt)) {
      alert("Sorry! You can only edit the post within 2 hours of posting.");
      setShowMenu(false);
      return;
    }
    setEditedContent(post.content);
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(
        `${API_BASE_URL}/api/posts/${post._id}`,
        { content: editedContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdatePost(data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update post:", error);
      alert("Failed to update post");
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedContent(post.content);
  };

  return (
    <div className={`p-4 rounded-xl shadow-sm border mb-6 transition-all duration-300 ${isEditable(post.createdAt) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'}`}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.user?._id}`}>
            <img
              src={post.user?.profile?.avatar ? `${API_BASE_URL}${post.user.profile.avatar}` : 'https://placehold.co/48x48'}
              alt="author"
              className="w-12 h-12 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-500"
            />
          </Link>
          <div>
            <Link to={`/profile/${post.user?._id}`}>
              <p className="font-bold hover:text-blue-600 hover:underline flex items-center gap-2">
                {post.user?.firstName} {post.user?.lastName}
                {isEditable(post.createdAt) && (
                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">✨ New</span>
                )}
              </p>
            </Link>
            <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        {isOwner && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-gray-100">
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border z-10">
                <button
                  onClick={handleEditClick}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="my-4 space-y-4">
        {!isEditing ? (
          <p>{post.content}</p>
        ) : (
          <div className="space-y-2">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full border rounded p-2 resize-none"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={handleEditSave}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={handleEditCancel}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {post.files?.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {post.files.map((file) => (
              <div key={file._id}>
                {file.fileType === 'image' ? (
                  <img src={`${API_BASE_URL}${file.url}`} alt="post content" className="rounded-lg object-cover w-full h-auto" />
                ) : (
                  <video src={`${API_BASE_URL}${file.url}`} controls className="rounded-lg w-full" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Location */}
      {post.location && (
        <div className="my-3 p-3 bg-gray-50 rounded-lg text-sm flex items-center gap-2">
          <MapPin size={16} className="text-gray-500" />
          <strong>Location:</strong> {post.location}
        </div>
      )}

      {/* Actions */}
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

      {/* Comments */}
      {showComments && (
        <div className="mt-4 border-t pt-4">
          <form onSubmit={handleAddComment} className="flex items-center gap-2 mb-4">
            <img
              src={currentUser.profile?.avatar ? `${API_BASE_URL}${currentUser.profile.avatar}` : 'https://placehold.co/32x32'}
              alt="You"
              className="w-8 h-8 rounded-full"
            />
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-grow bg-gray-100 rounded-full px-4 py-2 focus:outline-none"
            />
            <button type="submit" className="p-2 text-blue-600 hover:bg-blue-100 rounded-full">
              <Send size={20} />
            </button>
          </form>
          <div className="space-y-3">
            {post.comments.map((comment) => (
              <Comment
                key={comment._id}
                comment={comment}
                currentUser={currentUser}
                postOwnerId={post.user?._id}
                onReplySubmit={handleReplySubmit}
                onDeleteComment={handleDeleteComment}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
