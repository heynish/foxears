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

    // Set default options if not provided
    const { x = 0, y = 0 } = options;


    console.log('Calling composite');
    // Overlay the images at the specified coordinates
    baseImage.composite(overlayImage, x, y);

    console.log('Calling buffer');
    // Save the composite image to a buffer
    const buffer = await baseImage.getBufferAsync(Jimp.MIME_PNG);

    console.log('Calling upload');
    try {
      const imageUrl = await uploadToS3(buffer, "fileName");
      console.log('Image URL:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('Error calling uploadToS3:', error);
    }
    console.log('After calling uploadToS3');
    return "https://mframes.vercel.app/2.png";
  } catch (error) {
    console.error('Error overlaying images:', error);
    throw new Error('Image overlay failed');
  }
}
