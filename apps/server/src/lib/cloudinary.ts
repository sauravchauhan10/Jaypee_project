import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo',
});

/**
 * Uploads a buffer directly to Cloudinary as a PDF document.
 */
export const uploadPdfBuffer = async (buffer: Buffer, publicId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'prescriptions',
        public_id: publicId,
        resource_type: 'raw', // PDFs should be raw or image depending on use case, usually raw for pure download
        type: 'authenticated', // STRICTLY PRIVATE ACCESS
        format: 'pdf',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        if (result && result.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(new Error('No secure URL returned from Cloudinary'));
        }
      }
    );

    // End the stream with the buffer
    uploadStream.end(buffer);
  });
};

/**
 * Generates a time-limited signed URL for an authenticated Cloudinary resource.
 * Expires in 1 hour.
 */
export const generateSignedPdfUrl = (publicId: string): string => {
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    type: 'authenticated',
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  });
};
