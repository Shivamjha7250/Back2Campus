// File: backend/routes/contribution.js

import express from 'express';
import { 
    createContribution, 
    getContributions, 
    upvoteContribution 
} from '../controllers/contributionController.js';

const router = express.Router();

// Route to create a new contribution
router.post('/create', createContribution);

// Route to get all contributions
router.get('/', getContributions);

// Route to upvote a specific contribution
router.put('/:id/upvote', upvoteContribution);

export default router;