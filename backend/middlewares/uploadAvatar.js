import multer from 'multer';
import path from 'path';
import fs from 'fs';

const avatarDir = path.join(process.cwd(), 'uploads', 'avatars');

if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '_' + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${unique}${path.extname(file.originalname)}`);
  },
});

export const uploadAvatar = multer({ storage });
