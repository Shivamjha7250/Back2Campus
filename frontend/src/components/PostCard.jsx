import React, { useState, useCallback } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Send,
  Trash2,
  MapPin,
  Edit
} from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import LikersModal from './LikersModal';
import API_BASE_URL from '../pages/apiConfig';

const isEditable = (createdAt) => {
  const now = new Date();
  const postTime = new Date(createdAt);
  return (now - postTime) / (1000 * 60 * 60) < 2; 
};

const Comment = ({ comment, currentUser, postOwnerId, onReplySubmit, onDeleteComment, isReadOnly }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReplySubmit(comment._id, replyText);
    setReplyText('');
    setShowReply(false);
  };

  const canDelete = currentUser?._id === postOwnerId || currentUser?._id === comment.user?._id;

  return (
    <div className="p-2 border rounded bg-gray-50 relative">
      <Link to={`/profile/${comment.user?._id}`} className="flex items-center gap-2 mb-1">
        <img
          src={comment.user?.profile?.avatar?.url || 'https://placehold.co/32x32'}
          alt={`${comment.user?.firstName} ${comment.user?.lastName}`}
          className="w-8 h-8 rounded-full object-cover cursor-pointer"
        />
        <p className="font-semibold cursor-pointer hover:underline">
          {comment.user?.firstName} {comment.user?.lastName}
        </p>
      </Link>
      <p className="pl-10">{comment.text}</p>

      {!isReadOnly && (
        <button
          onClick={() => setShowReply(!showReply)}
          className="text-sm text-blue-500 mt-1 pl-10 hover:underline"
        >
          Reply
        </button>
      )}

      {!isReadOnly && canDelete && (
        <button
          onClick={() => onDeleteComment(comment._id)}
          className="absolute top-2 right-2 text-red-600 hover:text-red-800"
        >
          <Trash2 size={14} />
        </button>
      )}

      {showReply && !isReadOnly && (
        <form onSubmit={handleReply} className="mt-2 flex items-center gap-2 pl-10">
          <input
            type="text"
            placeholder="Write a reply..."
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            className="flex-1 bg-white border rounded-full px-3 py-1 text-sm"
          />
          <button type="submit" className="text-blue-500">
            <Send size={16} />
          </button>
        </form>
      )}

      {comment.replies?.length > 0 && (
        <div className="ml-4 mt-2 space-y-2">
          {comment.replies.map(reply => {
            const canDelReply =
              currentUser?._id === postOwnerId || currentUser?._id === reply.user?._id;
            return (
              <div
                key={reply._id}
                className="text-sm bg-gray-100 p-2 rounded flex items-center gap-2 relative"
              >
                <Link to={`/profile/${reply.user?._id}`} className="flex items-center gap-2">
                  <img
                    src={reply.user?.profile?.avatar?.url || 'https://placehold.co/24x24'}
                    alt={`${reply.user?.firstName} ${reply.user?.lastName}`}
                    className="w-6 h-6 rounded-full object-cover cursor-pointer"
                  />
                  <p className="font-semibold cursor-pointer hover:underline">
                    {reply.user?.firstName} {reply.user?.lastName}
                  </p>
                </Link>
                <p>{reply.text}</p>

                {canDelReply && !isReadOnly && (
                  <button
                    onClick={() => onDeleteComment(reply._id, comment._id)}
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={12} />
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

const PostCard = ({ post, currentUser, onUpdatePost, onPostDelete, isReadOnly = false }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editedContent, setEditedContent] = useState(post.content);
  const [isEditing, setIsEditing] = useState(false);
  const [likers, setLikers] = useState([]);
  const [showLikersModal, setShowLikersModal] = useState(false);
  const [showShareBox, setShowShareBox] = useState(false);

  const isOwner = currentUser?._id === post.user?._id;

  const isLiked = currentUser && post.likes
    ? post.likes.some(like => like.user?._id === currentUser._id)
    : false;

  const formatDate = dateString =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const handleInteraction = () => {
    if (isReadOnly || !currentUser) {
      if (window.confirm('Please log in to interact?')) navigate('/login');
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!handleInteraction() || !onUpdatePost) return;
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(
        `${API_BASE_URL}/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdatePost(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikesClick = useCallback(async () => {
    if (!post.likes.length) return;
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `${API_BASE_URL}/api/posts/${post._id}/likers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLikers(data);
      setShowLikersModal(true);
    } catch (err) {
      console.error(err);
    }
  }, [post._id, post.likes.length]);

  const handleCommentSubmit = async e => {
    e.preventDefault();
    if (!newComment.trim() || !handleInteraction() || !onUpdatePost) return;
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplySubmit = async (commentId, replyText) => {
    if (!handleInteraction() || !onUpdatePost) return;
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API_BASE_URL}/api/posts/${post._id}/comments/${commentId}/reply`,
        { text: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdatePost(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (cid, parentId = null) => {
    if (!handleInteraction() || !onUpdatePost) return;
    if (!window.confirm(parentId ? 'Delete reply?' : 'Delete comment?')) return;
    try {
      const token = localStorage.getItem('token');
      const url = parentId
        ? `${API_BASE_URL}/api/posts/${post._id}/comments/${parentId}/reply/${cid}`
        : `${API_BASE_URL}/api/posts/${post._id}/comments/${cid}`;
      const { data } = await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdatePost(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = () => {
    if (!isEditable(post.createdAt)) {
      alert('Editing allowed only within 2 hours.');
      setShowMenu(false);
      return;
    }
    setEditedContent(post.content);
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleEditSave = async () => {
    if (!onUpdatePost) return;
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(
        `${API_BASE_URL}/api/posts/${post._id}`,
        { content: editedContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdatePost(data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedContent(post.content);
  };

  const handleShare = () => {
    setShowShareBox(!showShareBox);
  };

  const copyToClipboard = async text => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied!');
    } catch (err) {
      console.error(err);
      alert('Copy failed');
    }
  };

  const publicUrl = `${window.location.origin}/public/post/${post._id}`;

  return (
    <div
      className={`p-4 mb-6 rounded-xl shadow-sm border ${
        isEditable(post.createdAt)
          ? 'bg-yellow-50 border-yellow-400'
          : 'bg-white border-gray-200'
      }`}
    >
     
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.user?._id}`}>
            <img
              src={post.user?.profile?.avatar?.url || 'https://placehold.co/48x48'}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
          </Link>
          <div>
            <Link to={`/profile/${post.user?._id}`}>
              <p className="font-bold">
                {post.user?.firstName} {post.user?.lastName}
              </p>
            </Link>
            <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        {isOwner && !isReadOnly && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-10">
                <button
                  onClick={handleEditClick}
                  className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this post?')) {
                      axios
                        .delete(`${API_BASE_URL}/api/posts/${post._id}`, {
                          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                        })
                        .then(() => {
                          if (onPostDelete) {
                            onPostDelete(post._id);
                          } else if (onUpdatePost) {
                            onUpdatePost(null);
                          }
                        });
                    }
                  }}
                  className="w-full text-left px-4 py-2 flex items-center gap-2 text-red-600 hover:bg-gray-100"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      
      <div className="mb-4">
        {!isEditing ? (
          <p>{post.content}</p>
        ) : (
          <div>
            <textarea
              value={editedContent}
              onChange={e => setEditedContent(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleEditSave}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Save
              </button>
              <button
                onClick={handleEditCancel}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {post.files?.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {post.files.map(file => (
              <div key={file._id}>
                {file.fileType === 'image' ? (
                  <img src={file.url} alt="post" className="w-full rounded" />
                ) : (
                  <video src={file.url} controls className="w-full rounded" />
                )}
              </div>
            ))}
          </div>
        )}

        {post.location && (
          <div className="mt-2 flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
            <MapPin size={16} /> {post.location}
          </div>
        )}
      </div>

      
      <div className="flex justify-between items-center border-t pt-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <button
              onClick={handleLike}
              disabled={isReadOnly}
              className={`flex items-center gap-1 hover:text-red-500 ${
                isLiked ? 'text-red-500' : ''
              }`}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} /> Like
            </button>
            <span
              onClick={handleLikesClick}
              className="cursor-pointer hover:underline text-sm"
            >
              {post.likes.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowComments(!showComments)}
              disabled={isReadOnly}
              className="flex items-center gap-1 hover:text-blue-500"
            >
              <MessageCircle size={18} /> Comment
            </button>
            <span
              onClick={() => setShowComments(true)}
              className="cursor-pointer hover:underline text-sm"
            >
              {post.comments?.length || 0}
            </span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 hover:text-green-500"
          >
            <Share2 size={18} /> Share
          </button>
        </div>
      </div>

     
      {showShareBox && (
        <div className="mt-2 p-2 bg-gray-100 border rounded flex justify-between items-center">
          <input
            type="text"
            readOnly
            value={publicUrl}
            className="flex-1 text-sm bg-transparent px-2"
          />
          <button
            onClick={() => copyToClipboard(publicUrl)}
            className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
          >
            Copy
          </button>
        </div>
      )}


      {showComments && (
        <div className="mt-4 pt-4 border-t space-y-3">
          {currentUser && (
            <form
              onSubmit={handleCommentSubmit}
              className="flex items-center gap-2 mb-3"
            >
              <img
                src={currentUser.profile?.avatar?.url || 'https://placehold.co/32x32'}
                alt="you"
                className="w-8 h-8 rounded-full"
              />
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-grow bg-gray-100 rounded-full px-4 py-2"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-blue-600 text-white rounded-full"
              >
                <Send size={20} />
              </button>
            </form>
          )}

          {post.comments
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(comment => (
              <Comment
                key={comment._id}
                comment={comment}
                currentUser={currentUser}
                postOwnerId={post.user?._id}
                onReplySubmit={handleReplySubmit}
                onDeleteComment={handleDeleteComment}
                isReadOnly={isReadOnly}
              />
            ))}
        </div>
      )}

      {showLikersModal && (
        <LikersModal users={likers} onClose={() => setShowLikersModal(false)} />
      )}
    </div>
  );
};

export default PostCard;
