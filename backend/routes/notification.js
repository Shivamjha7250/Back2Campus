import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController.js';
import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', auth, getNotifications);


router.put('/read', auth, markAsRead);

export default router;
