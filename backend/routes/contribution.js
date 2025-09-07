import express from 'express';
import {
  createContribution,
  getContributions,
  upvoteContribution,
  getRecentContributions,
  deleteContribution,
  addCommentToContribution
} from '../controllers/contributionController.js';

const router = express.Router();

//  Create a new contribution
router.post('/create', createContribution);

//  Get all contributions
router.get('/', getContributions);

//  Get recent contributions (last 24 hours)
router.get('/recent', getRecentContributions);

//  Upvote or remove upvote
router.put('/:id/upvote', upvoteContribution);

//  Delete a contribution (only by owner)
router.delete('/:id', deleteContribution);

//  Add a comment to a contribution
router.post('/:id/comments', addCommentToContribution);

export default router;
