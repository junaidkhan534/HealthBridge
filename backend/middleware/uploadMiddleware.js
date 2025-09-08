// middleware/uploadMiddleware.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Extracted from CLOUDINARY_URL
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});
// Note: You need to manually add the cloud_name, api_key, and api_secret to your .env file
// by splitting them from the CLOUDINARY_URL you copied.

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'healthbridge_profiles', // A folder name in your Cloudinary account
    allowed_formats: ['jpeg', 'png', 'jpg'],
  },
});

const upload = multer({ storage: storage });

module.exports = upload;