import multer from 'multer';
import path from 'path';

// Set storage location and file name based on environment
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = '';
    /* ============ Check if server is running on localhost or live domain ======= */
    if (req.hostname === 'localhost' || req.hostname === '127.0.0.1') {
      // Localhost path
      uploadPath = `./public/uploads/${file.fieldname}`; 
    } else {
      // Live domain path
      uploadPath = '/var/www/uploads';
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExtension);
  }
});

const upload = multer({ storage: storage });

export default upload;
