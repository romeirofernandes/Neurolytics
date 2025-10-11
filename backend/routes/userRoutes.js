const express = require('express');
const router = express.Router();
const { registerOrLoginUser } = require('../controllers/userController');

router.post('/auth', registerOrLoginUser);

module.exports = router;
