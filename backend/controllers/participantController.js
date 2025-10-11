const Participant = require('../models/Participants');
const bcrypt = require('bcryptjs');

// Register a new participant
const registerParticipant = async (req, res) => {
  console.log('========== REGISTER PARTICIPANT REQUEST ==========');
  console.log('Request body:', req.body);
  
  try {
    const { password, age, gender, education, city } = req.body;
    console.log('Extracted fields:', { password: password ? '***' : undefined, age, gender, education, city });

    // Validate required fields
    if (!password || !age || !gender || !education) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ 
        message: 'Password, age, gender, and education are required fields' 
      });
    }

    console.log('Hashing password...');
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Create new participant
    console.log('Creating participant object...');
    const participant = new Participant({
      password: hashedPassword,
      age,
      gender,
      education,
      city: city || undefined,
      experimentsParticipated: []
    });

    console.log('Saving participant to database...');
    await participant.save();
    console.log('Participant saved successfully with ID:', participant._id);

    const response = {
      message: 'Participant registered successfully',
      participant: {
        id: participant._id,
        age: participant.age,
        gender: participant.gender,
        education: participant.education,
        city: participant.city,
        experimentsParticipated: participant.experimentsParticipated
      }
    };
    
    console.log('Sending success response:', response);
    res.status(201).json(response);
  } catch (error) {
    console.error('❌ ERROR in registerParticipant:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login participant
const loginParticipant = async (req, res) => {
  console.log('========== LOGIN PARTICIPANT REQUEST ==========');
  console.log('Request body:', { id: req.body.id, password: req.body.password ? '***' : undefined });
  
  try {
    const { id, password } = req.body;

    // Validate required fields
    if (!id || !password) {
      console.log('Validation failed - missing ID or password');
      return res.status(400).json({ 
        message: 'ID and password are required' 
      });
    }

    console.log('Finding participant by ID:', id);
    // Find participant by ID
    const participant = await Participant.findById(id);

    if (!participant) {
      console.log('Participant not found with ID:', id);
      return res.status(404).json({ message: 'Participant not found' });
    }

    console.log('Participant found, verifying password...');
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, participant.password);

    if (!isPasswordValid) {
      console.log('Invalid password for participant:', id);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful for participant:', id);
    const response = {
      message: 'Login successful',
      participant: {
        id: participant._id,
        age: participant.age,
        gender: participant.gender,
        education: participant.education,
        city: participant.city,
        experimentsParticipated: participant.experimentsParticipated,
        createdAt: participant.createdAt,
        updatedAt: participant.updatedAt
      }
    };
    
    console.log('Sending login response:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ ERROR in loginParticipant:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get participant by ID
const getParticipantById = async (req, res) => {
  try {
    const { id } = req.params;

    const participant = await Participant.findById(id).populate('experimentsParticipated');

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    res.status(200).json({
      participant: {
        id: participant._id,
        age: participant.age,
        gender: participant.gender,
        education: participant.education,
        city: participant.city,
        experimentsParticipated: participant.experimentsParticipated,
        createdAt: participant.createdAt,
        updatedAt: participant.updatedAt
      }
    });
  } catch (error) {
    console.error('Error in getParticipantById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerParticipant,
  loginParticipant,
  getParticipantById
};
