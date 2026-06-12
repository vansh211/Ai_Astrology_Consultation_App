const cloudinary = require('cloudinary').v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

let isConfigured = false;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
  isConfigured = true;
  console.log('Cloudinary initialized successfully.');
} else {
  console.log('Cloudinary credentials missing. File uploads will be stored locally.');
}

/**
 * Uploads a local file to Cloudinary (falls back to returning local relative path if not configured)
 */
const uploadToCloudinary = async (filePath, folder = 'astrology_consultations') => {
  if (isConfigured) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: 'auto',
        folder: folder
      });
      return {
        url: result.secure_url,
        publicId: result.public_id,
        isCloud: true
      };
    } catch (error) {
      console.error('Cloudinary upload failed, using local path:', error.message);
    }
  }

  // Fallback: Convert absolute path to a URL relative to our backend server
  const filename = filePath.split(/[\\/]/).pop();
  return {
    url: `/uploads/${filename}`,
    publicId: `local_${filename}`,
    isCloud: false
  };
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  isCloudinaryConfigured: () => isConfigured
};
