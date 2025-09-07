import multer from 'multer';
import path from 'path';
import fs from 'fs';

const avatarDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${unique}${path.extname(file.originalname)}`);
  },
});

const chatDir = path.join(process.cwd(), 'uploads', 'chat');
if (!fs.existsSync(chatDir)) {
  fs.mkdirSync(chatDir, { recursive: true });
}
const chatStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, chatDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `chat-${unique}${path.extname(file.originalname)}`);
  },
});

const postDir = path.join(process.cwd(), 'uploads', 'posts');
if (!fs.existsSync(postDir)) {
  fs.mkdirSync(postDir, { recursive: true });
}
const postStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, postDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `post-${unique}${path.extname(file.originalname)}`);
  },
});


export const uploadAvatar = multer({ storage: avatarStorage });
export const uploadChatFile = multer({ storage: chatStorage });
export const uploadPostFiles = multer({ storage: postStorage }); 