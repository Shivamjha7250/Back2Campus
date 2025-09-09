import express from 'express';
import { 
    sendRequest, 
    respondToRequest, 
    getReceivedRequests,
    getMyConnections,
    removeConnection
} from '../controllers/connectionController.js';
import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/send', auth, sendRequest);

router.put('/respond', auth, respondToRequest);

router.get('/received', auth, getReceivedRequests);

router.get('/my', auth, getMyConnections); 

router.delete('/remove/:connectionId', auth, removeConnection);

export default router;
