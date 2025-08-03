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
    await Request.findByIdAndDelete(requestId); // Remove request from DB

    // Optional: Add to connections if accepted
    if (action === 'accept') {
      // Save connection logic here
    }

    res.json({ message: `Request ${action}ed.` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to respond to request.' });
  }
};
