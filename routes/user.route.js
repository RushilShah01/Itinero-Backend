import express from 'express';
import { registerUser, loginUser, logoutUser, controlAccess, getUsers } from '../controllers/user.controller.js'

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/logout',logoutUser);
router.put('/update-role',controlAccess)
router.get('/',getUsers)

export default router;