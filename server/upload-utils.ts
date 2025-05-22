import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename using timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `company-logo-${uniqueSuffix}${ext}`);
  }
});

// Create file filter to only allow images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Export configured uploader
export const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  }
});

// Convert data URL to file and save
export const saveDataUrlAsFile = (dataUrl: string, userId: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Extract the base64 data from the data URL
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid data URL format');
      }
      
      const type = matches[1];
      const data = matches[2];
      const buffer = Buffer.from(data, 'base64');
      
      // Get file extension from mime type
      const ext = type.split('/')[1] || 'png';
      
      // Create unique filename
      const filename = `company-logo-${userId}-${Date.now()}.${ext}`;
      const filepath = path.join(uploadDir, filename);
      
      // Write the file
      fs.writeFileSync(filepath, buffer);
      
      // Return the relative path
      resolve(`/uploads/${filename}`);
    } catch (error) {
      reject(error);
    }
  });
};