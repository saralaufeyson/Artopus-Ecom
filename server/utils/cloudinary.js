import { v2 as cloudinary } from 'cloudinary';

const DEFAULT_TRANSFORMATION = {
  fetch_format: 'auto',
  quality: 'auto',
  crop: 'limit',
  width: 1200,
};

export function ensureCloudinaryConfigured() {
  if (!isCloudinaryConfigured()) return false;

  if (process.env.CLOUDINARY_URL) {
    cloudinary.config(process.env.CLOUDINARY_URL);
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  return true;
}

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_URL
    || (
      process.env.CLOUDINARY_CLOUD_NAME
      && process.env.CLOUDINARY_API_KEY
      && process.env.CLOUDINARY_API_SECRET
    )
  );
}

function getConfiguredCloudName() {
  if (process.env.CLOUDINARY_CLOUD_NAME) return process.env.CLOUDINARY_CLOUD_NAME;

  const url = process.env.CLOUDINARY_URL || '';
  const match = url.match(/@([^/?]+)/);
  return match?.[1] || '';
}

export function getOptimizedCloudinaryUrl(source, options = {}) {
  if (!source || !ensureCloudinaryConfigured()) return source;

  const transformation = { ...DEFAULT_TRANSFORMATION, ...options };
  const cloudName = getConfiguredCloudName();
  const sourceValue = String(source);

  if (sourceValue.includes(`res.cloudinary.com/${cloudName}/`)) {
    const uploadMarker = '/upload/';
    const markerIndex = sourceValue.indexOf(uploadMarker);

    if (markerIndex === -1) return sourceValue;

    const prefix = sourceValue.slice(0, markerIndex + uploadMarker.length);
    let suffix = sourceValue.slice(markerIndex + uploadMarker.length);

    if (suffix.startsWith('f_') || suffix.startsWith('q_') || suffix.startsWith('c_') || suffix.startsWith('w_')) {
      const nextSlash = suffix.indexOf('/');
      if (nextSlash !== -1) suffix = suffix.slice(nextSlash + 1);
    }

    const transformationString = [
      transformation.fetch_format ? `f_${transformation.fetch_format}` : null,
      transformation.quality ? `q_${transformation.quality}` : null,
      transformation.crop ? `c_${transformation.crop}` : null,
      transformation.width ? `w_${transformation.width}` : null,
    ].filter(Boolean).join(',');

    return `${prefix}${transformationString}/${suffix}`;
  }

  return cloudinary.url(sourceValue, {
    secure: true,
    transformation,
  });
}

export async function uploadAssetToCloudinary(source, options = {}) {
  if (!ensureCloudinaryConfigured() || !source) return null;

  return cloudinary.uploader.upload(source, {
    folder: 'artopus',
    resource_type: 'image',
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    ...options,
  });
}

export default cloudinary;
