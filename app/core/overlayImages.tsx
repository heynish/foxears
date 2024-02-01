// utils/imageOverlay.ts

import Jimp from 'jimp';
import fs from 'fs';


export interface OverlayOptions {
  x?: number; // X-coordinate of the overlay position (default: 0)
  y?: number; // Y-coordinate of the overlay position (default: 0)
}

export async function overlayImages(baseImagePath: string, overlayImagePath: string, outputPath: string, options: OverlayOptions = {}): Promise<void> {
  try {
    // Load base and overlay images using Jimp
    const baseImage = await Jimp.read(baseImagePath);
    const overlayImage = await Jimp.read(overlayImagePath);

    // Set default options if not provided
    const { x = 0, y = 0 } = options;

    // Overlay the images at the specified coordinates
    baseImage.composite(overlayImage, x, y);

    // Convert the modified image to a buffer
    const imageBuffer = await baseImage.getBufferAsync(Jimp.MIME_JPEG);

    // Write the buffer to the output file
    await fs.promises.writeFile(outputPath, imageBuffer);
  } catch (error) {
    console.error('Error overlaying images:', error);
    throw new Error('Image overlay failed');
  }
}
