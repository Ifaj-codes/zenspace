const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const storeAdapter = require('../config/storeAdapter');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'zenspace_cse324_jwt_secret_baiust_2026_secure';
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      studentId: user.studentId || '1119004',
      department: user.department || 'CSE',
    },
    secret,
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, studentId, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existingUser = await storeAdapter.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const newUser = await storeAdapter.createUser({
      name,
      email,
      password,
      studentId,
      department,
    });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          studentId: newUser.studentId,
          department: newUser.department,
        },
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await storeAdapter.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          studentId: user.studentId,
          department: user.department,
        },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: err.message,
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await storeAdapter.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.',
      error: err.message,
    });
  }
};

exports.reseed = async (req, res) => {
  try {
    storeAdapter.reseedDemo();
    res.status(200).json({
      success: true,
      message: 'Demo dataset re-initialized successfully.',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to reseed database.',
      error: err.message,
    });
  }
};
