import TravelRequest from '../models/travelreq.model.js';
import User from '../models/user.model.js';

// Submit new travel request
export const createTravelRequest = async (req, res) => {
  const { destination, startDate, endDate, purpose, expenseType, expense } = req.body;

  try {
    // Validate required fields
    if (!destination || !startDate || !endDate || !purpose || !expenseType || expense === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate expenseType
    const validExpenseTypes = ['Hotel', 'Flight', 'Both'];
    if (!validExpenseTypes.includes(expenseType)) {
      return res.status(400).json({ message: 'Invalid expense type' });
    }

    // Validate dates
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < today) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Validate expense (must be a positive number)
    if (expense < 0 || isNaN(expense)) {
      return res.status(400).json({ message: 'Expense must be a positive number' });
    }

    // Fetch the user details
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for existing travel requests with overlapping dates for the same user
    const existingRequest = await TravelRequest.findOne({
      user: req.user.id,
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } }, // Overlapping period
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a travel request for these dates' });
    }

    // Create and save new travel request
    const newRequest = new TravelRequest({
      user: req.user.id,
      userName: user.name,
      destination,
      startDate,
      endDate,
      purpose,
      expenseType,
      expense,
    });

    await newRequest.save();

    res.status(201).json({ message: 'Travel request submitted successfully', travelRequest: newRequest });
  } catch (error) {
    console.error('Error creating travel request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get history of user
export const getHistory = async (req, res) => {
  try {
    // Use indexed query for optimization
    const requests = await TravelRequest.find({ user: req.user.id }).sort({ createdAt: -1 });

    if (!requests.length) {
      return res.status(404).json({ message: 'No travel requests found' });
    }

    res.json(requests);
  } catch (error) {
    console.error('Error fetching travel request status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};