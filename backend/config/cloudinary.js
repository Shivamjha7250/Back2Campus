import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv'; 

dotenv.config(); 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    let folderName = 'uploads/others';

    if (file.fieldname === 'avatar') {
      folderName = 'uploads/avatars';
    } else if (file.fieldname === 'files') {
      folderName = 'uploads/posts';
    } else if (file.fieldname === 'chatFile') {
      folderName = 'uploads/chat';
    }

    return {
      folder: folderName,
      resource_type: 'auto',
    };
  },
});

const upload = multer({ storage: storage });

export default upload;