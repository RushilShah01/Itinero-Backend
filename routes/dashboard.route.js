import express from 'express';
import { getAllTravelRequests, getDashboardData, getUserTrips } from '../controllers/dashboard.controller.js';
import { isAdmin, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, isAdmin, getDashboardData);
router.get('/all-requests', protect, isAdmin, getAllTravelRequests);
router.get('/user-trips',protect,getUserTrips)
// router.get('/employee-expenses', protect, isAdmin, getEmployeeExpenses);

export default router;