// File: backend/routes/connection.js
import express from 'express';
import { 
    sendRequest, 
    respondToRequest, 
    getReceivedRequests,
    getMyConnections,
    removeConnection
} from '../controllers/connectionController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// POST /api/connections/send
router.post('/send', auth, sendRequest);

// PUT /api/connections/respond
router.put('/respond', auth, respondToRequest);

// GET /api/connections/received
router.get('/received', auth, getReceivedRequests);

// GET /api/connections/my
router.get('/my', auth, getMyConnections); // ✅ Yeh route ab kaam karega

// DELETE /api/connections/remove/:connectionId
router.delete('/remove/:connectionId', auth, removeConnection);

export default router;
