// import jwt from 'jsonwebtoken';
// import User from '../models/user.model.js';
// import { ApiResponse } from '../utils/ApiResponse.js';
// import { ApiError } from '../utils/ApiError.js';

//  const registerUser = async (req, res) => {
//     const { name, email, password, role } = req.body;

//     try {
//         // Edge Case 1: Check if all fields are provided
//         if (!name || !email || !password) {
//             return res.status(400).json(new ApiResponse(400, "All fields are required"));
//         }

//         // Edge Case 2: Validate email format
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(email)) {
//             return res.status(400).json(new ApiResponse(400, "Invalid email format"));
//         }

//         // Edge Case 3: Check if user already exists
//         const userExists = await User.findOne({ email });
//         if (userExists) {
//             return res.status(409).json(new ApiResponse(409, "User already exists"));
//         }

//         // Edge Case 4: Validate password length
//         if (password.length < 6) {
//             return res.status(400).json(new ApiResponse(400, "Password must be at least 6 characters long"));
//         }

//         // Create new user
//         const user = new User({ name, email, password, role });
//         await user.save();

//         // Generate JWT token
//         const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

//         // Set token in cookies
//         res.cookie("token", token, {
//             httpOnly: true,  // Secure, prevents XSS
//             secure: process.env.NODE_ENV === "production", // Use secure cookies in production
//             sameSite: "strict", // CSRF protection
//             maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
//         });

//         // Send response
//         res.status(201).json(new ApiResponse(201, "User registered successfully", { token, role }));

//     } catch (error) {
//         console.error(error);
//         res.status(500).json(new ApiError(500, "Error registering user"));
//     }
// };

//  const loginUser = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Edge Case 1: Validate required fields.
//         if (!email || !password) {
//             return res.status(400).json(new ApiResponse(400, "Email and password are required"));
//         }

//         // Edge Case 2: Validate email format (optional but recommended).
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(email)) {
//             return res.status(400).json(new ApiResponse(400, "Invalid email format"));
//         }

//         // Find the user by email.
//         const user = await User.findOne({ email });
//         if (!user) {
//             // User not found.
//             return res.status(404).json(new ApiResponse(404, "User not found"));
//         }

//         // Edge Case 3: Check if the provided password matches the stored password.
//         // Note: As requested, no password encryption (like bcrypt) is used.
//         if (user.password !== password) {
//             return res.status(401).json(new ApiResponse(401, "Invalid credentials"));
//         }

//         // Generate a JWT token that includes only the user._id in its payload.
//         const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

//         // Store the token in an HTTP-only cookie for security.
//         res.cookie("token", token, {
//             httpOnly: true,  // Prevents client-side JavaScript from accessing the cookie.
//             secure: process.env.NODE_ENV === "production", // Use secure cookies in production.
//             sameSite: "strict", // Helps protect against CSRF attacks.
//             maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days expiration.
//         });

//         // Respond with a success message and include the user's role.
//         // The role can then be stored in localStorage on the frontend.
//         res.status(200).json(new ApiResponse(200, "Login successful", { role: user.role }));
//     } catch (error) {
//         console.error("Error logging in:", error);
//         res.status(500).json(new ApiError(500, "Error logging in"));
//     }
// };

// const logoutUser = async (req, res) => {
//     try {
//         // Clear the 'token' cookie. This removes the JWT stored on the client.
//         res.clearCookie("token", {
//             httpOnly: true,  
//             secure: process.env.NODE_ENV === "production",
//             sameSite: "strict",
//         });
        
//         // Return a success message.
//         res.status(200).json(new ApiResponse(200, "Logout successful"));
//     } catch (error) {
//         console.error("Error logging out:", error);
//         res.status(500).json(new ApiError(500, "Error logging out"));
//     }
// };

// export { registerUser, loginUser, logoutUser };

import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import validator from 'validator'; // For email and password validation

// Register User
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const user = new User({ name, email, password});
    await user.save();

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // Set cookies
    res.cookie('token', token, { httpOnly: false, secure: process.env.NODE_ENV === 'production' });
    res.cookie('userId', user._id.toString(), { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.cookie('role', user.role, { httpOnly: false, secure: process.env.NODE_ENV === 'production' });

    // Send response
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare entered password with stored password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // Set cookies
    res.cookie('token', token, { httpOnly: false, secure: process.env.NODE_ENV === 'production' });
    res.cookie('userId', user._id.toString(), { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.cookie('role', user.role, { httpOnly: false, secure: process.env.NODE_ENV === 'production' });

    // Send response
    res.json({
      message: 'User logged in successfully',
      token,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Error logging in user', error: error.message });
  }
};

// Logout User
export const logoutUser = async (req, res) => {
  try {
    // Clear cookies
    res.clearCookie('token', { httpOnly: false, secure: process.env.NODE_ENV === 'production', path: '/' });
    res.clearCookie('userId', { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
    res.clearCookie('role', { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });

    // Send response
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'An error occurred during logout' });
  }
};

export const controlAccess = async (req, res) => {
  const { userId, newRole } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true } // This ensures the updated user is returned
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User role updated successfully", role: user.role });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password
    res.json(users); // Send only the array, not an object
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

