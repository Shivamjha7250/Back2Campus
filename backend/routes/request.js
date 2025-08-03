import express from 'express';
import { getRequests, respondToRequest } from '../controllers/requestController.js';

const router = express.Router();

router.get('/:userId', getRequests); // Get all requests for a user
router.post('/respond', respondToRequest); // Accept or reject

export default router;
