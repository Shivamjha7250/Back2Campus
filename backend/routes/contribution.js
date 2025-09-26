import express from 'express';
import {
  createContribution,
  getContributions,
  upvoteContribution,
  getRecentContributions,
  deleteContribution,
  addCommentToContribution,
  getLikersForContribution,
  addReplyToComment,
  deleteCommentFromContribution,
  deleteReplyFromComment
} from '../controllers/contributionController.js';

const router = express.Router();

router.post('/create', createContribution);
router.get('/', getContributions);
router.get('/recent', getRecentContributions);
router.put('/:id/upvote', upvoteContribution);
router.get('/:id/likers', getLikersForContribution);
router.delete('/:id', deleteContribution);
router.post('/:id/comments', addCommentToContribution);
router.post('/:postId/comments/:commentId/replies', addReplyToComment);
router.delete('/:postId/comments/:commentId', deleteCommentFromContribution);
router.delete('/:postId/comments/:commentId/replies/:replyId', deleteReplyFromComment);

export default router;