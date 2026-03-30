const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const extension = file.originalname.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'png', 'jpeg'].includes(extension);
    
    return {
      folder: 'collabsphere_uploads',
      resource_type: isImage ? 'image' : 'raw', 
      public_id: file.originalname.split('.')[0] + '-' + Date.now(),
      // Remove allowed_formats to see if it fixes PNG issue, or keep them
      allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'txt'],
    };
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
