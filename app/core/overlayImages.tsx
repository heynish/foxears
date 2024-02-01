import Jimp from 'jimp';
import { uploadToS3 } from './uploadToS3';

export interface OverlayOptions {
  x?: number; // X-coordinate of the overlay position (default: 0)
  y?: number; // Y-coordinate of the overlay position (default: 0)
}

export async function overlayImages(baseImagePath: string, overlayImagePath: string, outputFileName: string, options: OverlayOptions = {}): Promise<string> {
  try {
    // Load base and overlay images using Jimp
    const baseImage = await Jimp.read(baseImagePath);
    const overlayImage = await Jimp.read(overlayImagePath);
    const url = "";

    // Set default options if not provided
    const { x = 0, y = 0 } = options;

    // Overlay the images at the specified coordinates
    baseImage.composite(overlayImage, x, y);

    // Save the composite image to a buffer
    const buffer = await baseImage.getBufferAsync(Jimp.MIME_PNG);

    uploadToS3(buffer, "final").then(imageUrl => {
      const url = imageUrl;
      console.log('The image has been uploaded. URL:', imageUrl);
    }).catch(error => {
      console.error('Error uploading to S3:', error);
    });
  

    // Return the path to the temporary file
    return url;
  } catch (error) {
    console.error('Error overlaying images:', error);
    throw new Error('Image overlay failed');
  }
}
