import Request from '../models/Request.js';

export const getRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await Request.find({ receiverId: userId });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests.' });
  }
};

export const respondToRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    await Request.findByIdAndDelete(requestId); 

    if (action === 'accept') {
    
    }

    res.json({ message: `Request ${action}ed.` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to respond to request.' });
  }
};
