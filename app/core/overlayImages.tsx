// utils/imageOverlay.ts

import Jimp from 'jimp';
import os from 'os';
import path from 'path';

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

    // Overlay the images at the specified coordinates
    baseImage.composite(overlayImage, x, y);

    // Get the path to the temporary directory
    const tmpDir = os.tmpdir();

    // Construct the output path in the temporary directory
    const outputPath = path.join(tmpDir, outputFileName);

    // Write the overlaid image to the temporary file
    await baseImage.writeAsync(outputPath);

    // Return the path to the temporary file
    return outputPath;
  } catch (error) {
    console.error('Error overlaying images:', error);
    throw new Error('Image overlay failed');
  }
}
