import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController.js';
import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/notifications
router.get('/', auth, getNotifications);

// PUT /api/notifications/read
router.put('/read', auth, markAsRead);

export default router;
