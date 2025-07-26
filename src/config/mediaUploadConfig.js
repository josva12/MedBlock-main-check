const multer = require('multer');
const path = require('path');

// Configure storage for media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/chat-media');
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and user ID
    const userId = req.user?._id || 'unknown';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    // Remove spaces and special characters from filename
    const cleanName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
    const filename = `media-${userId}-${timestamp}-${cleanName}`;
    cb(null, filename);
  }
});

// File filter for media uploads
const fileFilter = (req, file, cb) => {
  // Allow images, videos, audio, and documents
  const allowedMimeTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    // Videos
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv',
    // Audio
    'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, audio, and documents are allowed.'), false);
  }
};

// Create multer instance for media uploads
const mediaUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only one file at a time
  }
});

module.exports = mediaUpload; 