import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.2, // Smaller size for DB efficiency
    maxWidthOrHeight: 600, // Balanced resolution
    useWebWorker: true,
    fileType: 'image/webp' // Using WebP for better compression
  };
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Compression failed:', error);
    return file; // Return original if compression fails
  }
}
