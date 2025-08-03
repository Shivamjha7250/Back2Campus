// File: backend/routes/post.js
import express from 'express';
import {
    createPost,
    getAllPosts,
    getMyPosts,
    editPost,
    deletePost,
    toggleLike,
    addComment,
    likeComment,
    replyToComment,
    deleteComment,
    deleteReply,
    likeReply
} from '../controllers/postController.js';
import { upload } from '../config/multer.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// ... (baaki ke routes jaise createPost, etc.)

// ✅ Suraksha ke liye 'auth' middleware ko wapas laya gaya hai
router.get('/', auth, getAllPosts);

// ... (baaki ke sabhi routes)

router.post('/create', auth, upload.array('files'), createPost);
router.get('/user/:userId', auth, getMyPosts);
router.put('/:id', auth, editPost);
router.delete('/:id', auth, deletePost);
router.put('/:id/like', auth, toggleLike);
router.post('/:id/comment', auth, addComment);
router.put('/:postId/comments/:commentId/like', auth, likeComment);
router.post('/:postId/comments/:commentId/reply', auth, replyToComment);
router.delete('/:postId/comments/:commentId', auth, deleteComment);
router.delete('/:postId/comments/:commentId/replies/:replyId', auth, deleteReply);
router.put('/:postId/comments/:commentId/replies/:replyId/like', auth, likeReply);

export default router;
