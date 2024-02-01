import Jimp from 'jimp';
import { uploadToS3 } from './uploadToS3';
import crypto from 'crypto';

export interface OverlayOptions {
  x?: number; // X-coordinate of the overlay position (default: 0)
  y?: number; // Y-coordinate of the overlay position (default: 0)
}

export async function overlayImages(baseImagePath: string, overlayImagePath: string, outputFileName: string, options: OverlayOptions = {}): Promise<string> {
  try {
    // Load base and overlay images using Jimp
    const baseImage = await Jimp.read(baseImagePath);
    const picture = await Jimp.read(overlayImagePath);

    // Scale down the picture (example: scale to 100x100)
    await picture.resize(100, Jimp.AUTO);

    // Create a circle mask
    const diameter = picture.getWidth(); // assuming width & height are equal after resize
    const mask = new Jimp(diameter, diameter, 0xFFFFFFFF); // start with a white circle on black bg
    await mask.scan(0, 0, mask.getWidth(), mask.getHeight(), function(x, y, idx) {
      const distance = Math.sqrt(
        Math.pow(x - diameter / 2, 2) + Math.pow(y - diameter / 2, 2)
      );
      if (distance > diameter / 2) {
        this.bitmap.data[idx + 0] = 0;
        this.bitmap.data[idx + 1] = 0;
        this.bitmap.data[idx + 2] = 0;
        this.bitmap.data[idx + 3] = 0; // Set alpha to 0 (transparent)
      }
    });

    // Apply the circle mask onto the picture
    picture.mask(mask, 0, 0);

    // Calculate the position to center the circle on the base image
    const x = (baseImage.bitmap.width / 2) - (diameter / 2);
    const y = (baseImage.bitmap.height / 2) - (diameter / 2);

    // Composite the picture onto the base image at the calculated position
    baseImage.composite(picture, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
      opacityDest: 1
    });


    /*
    // Set default options if not provided
    const { x = 0, y = 0 } = options;


    console.log('Calling composite');
    // Overlay the images at the specified coordinates
    baseImage.composite(overlayImage, x, y); */

    console.log('Calling buffer');
    // Save the composite image to a buffer
    const buffer = await baseImage.getBufferAsync(Jimp.MIME_PNG);

    console.log('Calling upload');
    try {
      const imageUrl = await uploadToS3(buffer, crypto.randomBytes(16).toString('hex')+".png");
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
