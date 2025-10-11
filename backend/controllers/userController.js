const User = require('../models/User');

// Register or login user (creates if doesn't exist)
const registerOrLoginUser = async (req, res) => {
  try {
    const { name, email, firebaseId } = req.body;

    if (!email || !firebaseId) {
      return res.status(400).json({ message: 'Email and Firebase ID are required' });
    }

    // Check if user exists by firebaseId
    let user = await User.findOne({ firebaseId });

    if (user) {
      // User exists, return their data
      return res.status(200).json({
        message: 'Login successful',
        user: {
          mongoId: user._id,
          name: user.name,
          email: user.email,
          firebaseId: user.firebaseId
        }
      });
    }

    // User doesn't exist, create new user
    if (!name) {
      return res.status(400).json({ message: 'Name is required for registration' });
    }

    user = new User({
      name,
      email,
      firebaseId
    });

    await user.save();

    res.status(201).json({
      message: 'Registration successful',
      user: {
        mongoId: user._id,
        name: user.name,
        email: user.email,
        firebaseId: user.firebaseId
      }
    });
  } catch (error) {
    console.error('Error in registerOrLoginUser:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerOrLoginUser
};
