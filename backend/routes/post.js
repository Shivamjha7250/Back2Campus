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
    likeReply,
    getPostById,
    getPostLikers,
    getPublicPostById 
} from '../controllers/postController.js';
import upload from '../config/cloudinary.js'; 
import auth from '../middlewares/authMiddleware.js';

const router = express.Router();


router.get('/', auth, getAllPosts);
router.post('/create', auth, upload.array('files'), createPost);

router.get('/user/:userId', auth, getMyPosts);
router.get('/public/:id', getPublicPostById); 
router.get('/:id/likers', auth, getPostLikers); 


router.get('/:id', auth, getPostById); 


router.put('/:id', auth, editPost);
router.delete('/:id', auth, deletePost);
router.put('/:id/like', auth, toggleLike);


router.post('/:id/comment', auth, addComment);
router.put('/:postId/comments/:commentId/like', auth, likeComment);
router.delete('/:postId/comments/:commentId', auth, deleteComment);

router.post('/:postId/comments/:commentId/reply', auth, replyToComment);
router.delete('/:postId/comments/:commentId/replies/:replyId', auth, deleteReply);
router.put('/:postId/comments/:commentId/replies/:replyId/like', auth, likeReply);

export default router;