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


router.post('/create', createContribution);

router.get('/', getContributions);

router.get('/recent', getRecentContributions);

router.put('/:id/upvote', upvoteContribution);


router.delete('/:id', deleteContribution);


router.post('/:id/comments', addCommentToContribution);

export default router;
