const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    
    let folderName = 'uploads/others';
    if (file.fieldname === 'avatar') {
      folderName = 'uploads/avatars';
    } else if (file.fieldname === 'postImage') { 
      folderName = 'uploads/posts';
    } else if (file.fieldname === 'chatFile') {
      folderName = 'uploads/chat';
    }
    return {
      folder: folderName,
      allowed_formats: ['jpeg', 'png', 'jpg', 'pdf', 'doc'] 
    };
  }
});

const upload = multer({ storage: storage });

module.exports = upload;