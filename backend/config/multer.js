import multer from 'multer'
import path   from 'path'
import fs     from 'fs'

const uploadDir = path.join(process.cwd(), 'uploads', 'chat')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '_' + Math.round(Math.random()*1e9)
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`)
  }
})

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})
