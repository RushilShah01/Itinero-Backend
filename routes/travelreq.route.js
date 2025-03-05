import express from 'express';
import { createTravelRequest, getHistory } from '../controllers/travelReq.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createTravelRequest); // Protect route with authMiddleware
router.get('/', protect, getHistory); // Protect route with authMiddleware

export default router;