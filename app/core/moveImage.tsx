import Jimp from 'jimp';
import { uploadToS3 } from './uploadToS3';
import crypto from 'crypto';
import ImageDetails from '../core/imageData';
import path from 'path';

export interface OverlayOptions {
  x?: number; // X-coordinate of the overlay position (default: 0)
  y?: number; // Y-coordinate of the overlay position (default: 0)
}


export async function moveImage(baseImagePath: string, x: number, y: number, w: number, options: OverlayOptions = {}): Promise<ImageDetails> {
  try {
    // Load base and overlay images using Jimp
    const overlayUrl = path.resolve('public/ears.png');
    const [baseImage, overlayImage] = await Promise.all([
      Jimp.read(baseImagePath),
      Jimp.read(overlayUrl)
    ]);

    const originalOverlayWidth = overlayImage.bitmap.width;
    const originalOverlayHeight = overlayImage.bitmap.height;
    const aspectRatioWidth = originalOverlayWidth;
    const aspectRatioHeight = originalOverlayHeight;

    // Calculate the new height while keeping the aspect ratio
    const newHeight = w * aspectRatioHeight / aspectRatioWidth;

    // Resize and position the overlay image
    overlayImage.resize(w, newHeight);
    //overlayImage.resize(w, Jimp.AUTO); // Maintain aspect ratio

    // Composite the overlay image onto the base image
    baseImage.composite(overlayImage, x, y);
    baseImage.quality(50);
    // Generate a random filename
    const filename = crypto.randomBytes(16).toString('hex') + ".png";

    // Get image buffer and upload to S3
    const buffer = await baseImage.getBufferAsync(Jimp.MIME_JPEG);
    const imageUrl = await uploadToS3(buffer, filename);

    return { urlfinal: imageUrl, urlbase: "baseUrl", x, y, w };

  } catch (error) {
    console.error('Error overlaying images:', error);
    throw new Error('Image overlay failed');
  }
}