import express from 'express';
import { getRequests, respondToRequest } from '../controllers/requestController.js';

const router = express.Router();

router.get('/:userId', getRequests); 
router.post('/respond', respondToRequest); 

export default router;
