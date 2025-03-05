import mongoose from 'mongoose';
import TravelRequest from '../models/travelreq.model.js';

// Accept or Reject a Travel Request
export const changeRequestStatus = async (req, res) => {
  const { requestId, status } = req.body; // Status can be 'Approved' or 'Rejected'

  // Validate `status` input
  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be "Approved" or "Rejected".' });
  }

  // Validate `requestId` format (prevents MongoDB errors)
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return res.status(400).json({ message: 'Invalid request ID format' });
  }

  try {
    // Find the travel request using index
    const request = await TravelRequest.findOne({ _id: requestId, status: 'Pending' });

    if (!request) {
      return res.status(404).json({ message: 'Pending travel request not found or already processed' });
    }

    // Update the status
    request.status = status;
    await request.save();

    res.json({
      message: `Travel request has been ${status}`,
      request,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Fetch all pending travel requests (Admin View)
export const pendingRequests = async (req, res) => {
  try {
    // Fetch pending requests efficiently using index
    const pendingRequests = await TravelRequest.find({ status: 'Pending' }).sort({ createdAt: -1 });

    if (pendingRequests.length === 0) {
      return res.status(404).json({ message: 'No pending travel requests found' });
    }

    res.json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};