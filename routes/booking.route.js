import express from 'express';
import { pendingRequests, changeRequestStatus } from '../controllers/booking.controller.js';
import { isAdmin, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, isAdmin, changeRequestStatus); // Protect route with authMiddleware
router.get('/', protect, isAdmin, pendingRequests); // Protect route with authMiddleware

export default router;