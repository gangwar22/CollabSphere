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
    return {
      folder: 'collabsphere_uploads',
      resource_type: 'auto', 
      public_id: file.originalname.split('.')[0] + '-' + Date.now(),
    };
  },
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', 
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', 
      '.h', '.html', '.css', '.scss', '.json', '.md', '.sql', '.sh', '.rs', '.go', '.php', '.rb'
    ];
    const extension = '.' + file.originalname.split('.').pop().toLowerCase();
    if (allowedExtensions.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error('File format not supported'), false);
    }
  }
});

module.exports = { cloudinary, upload };
