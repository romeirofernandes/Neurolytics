const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'audio/mpeg',
      'audio/wav',
      'audio/mp3',
      'audio/ogg',
      'audio/webm',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-msvideo'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only images, audio, and video files are allowed.`));
    }
  },
});

router.post('/image', upload.single('file'), uploadController.uploadImage);
router.post('/audio', upload.single('file'), uploadController.uploadAudio);
router.post('/video', upload.single('file'), uploadController.uploadVideo);

module.exports = router;