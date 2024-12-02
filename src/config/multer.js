const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    
    const dest = file.fieldname === 'profileImage' 
      ? 'profiles' 
      : 'errands';
    cb(null, path.join(__dirname, `../../uploads/${dest}`));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});


const fileFilter = (req, file, cb) => {
  
  console.log(file.mimetype);
  if (!file.mimetype.startsWith('application/octet-stream')) {
    return cb(new Error('Only image files are allowed!'), false);
  }

 
  const allowedExtensions = ['.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG', '.gif', '.GIF'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Only .jpg, .jpeg, .png and .gif files are allowed!'), false);
  }

  cb(null, true);
};


const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 
  }
});

module.exports = upload; 