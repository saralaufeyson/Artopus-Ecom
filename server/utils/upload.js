import multer from 'multer';
import CloudinaryStorage from 'multer-storage-cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary, { ensureCloudinaryConfigured, getOptimizedCloudinaryUrl } from './cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getUploadedImageUrl(file) {
  if (!file) return null;

  const filePath = typeof file.path === 'string' ? file.path : null;
  const secureUrl = typeof file.secure_url === 'string' ? file.secure_url : null;
  const filename = typeof file.filename === 'string' ? file.filename : null;
  const publicId = typeof file.public_id === 'string' ? file.public_id : null;

  if (filePath?.startsWith('http')) {
    return getOptimizedCloudinaryUrl(filename || publicId || filePath);
  }

  if (secureUrl) {
    return getOptimizedCloudinaryUrl(secureUrl);
  }

  if (filename || publicId) {
    return getOptimizedCloudinaryUrl(filename || publicId);
  }

  if (filePath) {
    return `/uploads/${path.basename(filePath)}`;
  }

  return null;
}

export function createUploadParser({
  folder = 'artopus',
  fileSizeLimit = 2 * 1024 * 1024,
  transformation = [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
} = {}) {
  let storage;

  if (ensureCloudinaryConfigured()) {
    storage = new CloudinaryStorage({
      cloudinary: { v2: cloudinary },
      params: {
        folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation,
      },
    });
  } else {
    storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
      },
    });
  }

  return multer({
    storage,
    limits: { fileSize: fileSizeLimit },
  });
}
