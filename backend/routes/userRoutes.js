// User Routes - Handles user registration and login

const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');

// ===== USER REGISTRATION =====
// POST /api/users/register
// Register a new user (student or recruiter)
router.post('/register', (req, res) => {
  try {
    const { name, email, password, confirmPassword, userType } = req.body;

    // Validation
    if (!name || !email || !password || !userType) {
      return res
        .status(400)
        .json({ error: 'Please fill in all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if user already exists
    if (userModel.findUserByEmail(email)) {
      return res
        .status(400)
        .json({ error: 'User with this email already exists' });
    }

    // Create new user
    const newUser = userModel.createUser({
      name,
      email,
      password, // Note: passwords are not hashed in this beginner project
      userType, // 'student' or 'recruiter'
    });

    // Return success response (excluding password)
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      userType: newUser.userType,
    };

    res.status(201).json({
      message: 'Registration successful!',
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// ===== USER LOGIN =====
// POST /api/users/login
// Login a user and return their details
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Please provide email and password' });
    }

    // Find user by email
    const user = userModel.findUserByEmail(email);

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Return user details (excluding password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      resume: user.resume,
    };

    res.status(200).json({
      message: 'Login successful!',
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ===== GET USER PROFILE =====
// GET /api/users/profile/:id
// Get user profile by ID
router.get('/profile/:id', (req, res) => {
  try {
    const userId = parseFloat(req.params.id);
    const user = userModel.findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user details (excluding password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      resume: user.resume,
      createdAt: user.createdAt,
    };

    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
});

// ===== UPDATE USER RESUME =====
// PUT /api/users/profile/:id/resume
// Update user's resume (for students)
router.put('/profile/:id/resume', (req, res) => {
  try {
    const userId = parseFloat(req.params.id);
    const { resume } = req.body;

    if (!resume) {
      return res.status(400).json({ error: 'Resume is required' });
    }

    const user = userModel.findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update resume
    const updatedUser = userModel.updateUser(userId, { resume });

    const userResponse = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      userType: updatedUser.userType,
      resume: updatedUser.resume,
    };

    res.status(200).json({
      message: 'Resume updated successfully!',
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating resume' });
  }
});

module.exports = router;
