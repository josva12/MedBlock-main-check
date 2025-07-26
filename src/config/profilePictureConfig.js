const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Define storage for profile picture uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create a dedicated directory for profile pictures
        const profilePicturesPath = path.join(__dirname, '..', 'uploads', 'profile-pictures');
        
        // Create the directory if it doesn't exist
        fs.mkdirSync(profilePicturesPath, { recursive: true });
        cb(null, profilePicturesPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp and user ID
        const userId = req.user?._id || 'unknown';
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);
        // Remove spaces and special characters from filename
        const cleanName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
        const filename = `profile-${userId}-${timestamp}-${cleanName}`;
        cb(null, filename);
    }
});

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Accept file
    } else {
        logger.warn(`Profile picture upload rejected: Invalid MIME type ${file.mimetype}`);
        cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed for profile pictures.'), false);
    }
};

// Configure Multer upload middleware for profile pictures
const profilePictureUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2 MB file size limit for profile pictures
    }
});

module.exports = profilePictureUpload; 