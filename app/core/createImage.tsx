import Jimp from 'jimp';
import { uploadToS3 } from './uploadToS3';
import crypto from 'crypto';
import path from 'path';

export async function createImage(name: string, description: string, category: string): Promise<String> {
  try {
    // Load base and overlay images using Jimp
    console.time('Image Processing Time');
    const image = await Jimp.read(path.resolve('public/linea-base.png'));
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    // Print the text on the image
    image.print(font, 0, 0, name)
      .print(font, 0, 50, description)
      .print(font, 0, 100, category)
      .quality(50); // Set the image quality

    // Save the composite image to a buffer
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    const newbuffer = Buffer.from(buffer);
    try {
      const imageUrl = await uploadToS3(newbuffer, crypto.randomBytes(16).toString('hex') + "temp.jpg");
      console.timeEnd('Image Processing Time');
      return imageUrl;
    } catch (error) {
      console.error('Error calling uploadToS3:', error);
    }
    return "";
  } catch (error) {
    console.error('Error overlaying images:', error);
    throw new Error('Image overlay failed');
  }
}
