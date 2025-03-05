import TravelRequest from '../models/travelreq.model.js';
import jwt from "jsonwebtoken"

// Get Dashboard Data (Admin Only)
export const getDashboardData = async (req, res) => {
  try {
    // Aggregate total expenses for approved requests
    const totalExpenseResult = await TravelRequest.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, total: { $sum: '$expense' } } },
    ]);
    const totalExpense = totalExpenseResult.length > 0 ? totalExpenseResult[0].total : 0;

    // Use indexed queries for counting documents
    const [totalRequests, totalAcceptedRequests, totalPendingRequests] = await Promise.all([
      TravelRequest.countDocuments(),
      TravelRequest.countDocuments({ status: 'Approved' }),
      TravelRequest.countDocuments({ status: 'Pending' }),
    ]);

    // Fetch employee expenses with aggregation
    const employeeExpenses = await TravelRequest.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: '$user', totalExpense: { $sum: '$expense' }, userName: { $first: '$userName' } } },
      { $sort: { totalExpense: -1 } },
    ]);

    // Ensure expenses is always an array, even if empty
    const expenses = employeeExpenses.length > 0 ? employeeExpenses : [];

    res.json({
      totalExpense,
      totalRequests,
      totalAcceptedRequests,
      totalPendingRequests,
      expenses,  // Returning the employee expenses here
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error', error: error.message, expenses: [] });  // Always return empty array in case of error
  }
};


export const getAllTravelRequests = async (req, res) => {
  try {
    // Extract user ID from the token
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const decoded = jwt.verify(token, 'JWT_SECRET');
    const userId = decoded.userId; // Assuming user ID is stored in the token payload

    // Fetch travel requests only for the logged-in user
    const requests = await TravelRequest.find({ user: userId }, 'user userName destination startDate endDate status expenseType expense')
      .sort({ createdAt: -1 });

    if (!requests.length) {
      return res.status(404).json({ message: 'No travel requests found for this user' });
    }

    res.json({ data: requests });
  } catch (error) {
    console.error('Error fetching travel requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const getUserTrips=async(req,res)=>{
  try {
    // Get the current date to categorize requests
    const today = new Date();

    // Fetch all travel requests for the authenticated user with status 'Approved'
    const travelRequests = await TravelRequest.find({
      user: req.user.id,
      status: 'Approved',
    });

    // Filter upcoming and completed requests
    const upcomingRequests = travelRequests.filter(
      (request) => new Date(request.startDate) > today
    );
    const completedRequests = travelRequests.filter(
      (request) => new Date(request.endDate) < today
    );

    // Send the response
    res.status(200).json({
      upcomingRequests,
      completedRequests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}