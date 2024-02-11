import Jimp from 'jimp';
import { uploadToS3 } from './uploadToS3';
import crypto from 'crypto';
import ImageDetails from '../core/imageData';
import path from 'path';
import sharp from 'sharp';

export interface OverlayOptions {
  x?: number; // X-coordinate of the overlay position (default: 0)
  y?: number; // Y-coordinate of the overlay npm i canvas@2.6.1position (default: 0)
}

export async function overlayImages(baseImagePath: string, overlayImagePath: string, outputFileName: string, options: OverlayOptions = {}): Promise<ImageDetails> {
  try {
    // Load base and overlay images using Jimp
    console.time('Image Processing Time 1');

    console.time('Image loading Time All');
    const baseImage = sharp(path.resolve('public/3.png'));
    const overlayImage = await Jimp.read(path.resolve('public/ears.png'));
    const picture = await Jimp.read(overlayImagePath);
    console.timeEnd('Image loading Time All');

    console.time('Image Resize Time');
    // Scale down the picture (example: scale to 100x100)
    picture.resize(300, Jimp.AUTO);
    // Determine the smallest dimension (width or height)
    const size = Math.min(picture.getWidth(), picture.getHeight());

    // Crop the image to make it square from the top
    const croppedImage = picture.crop(0, 0, size, size);
    console.timeEnd('Image Resize Time');

    console.time('Image Masking Time');
    // Create a circle mask with full transparency
    const diameter = croppedImage.getWidth();
    const mask = new Jimp(diameter, diameter, 0x00000000); // Fully transparent

    // Draw a white circle on the mask
    mask.scan(0, 0, diameter, diameter, function (x, y, idx) {
      const distance = Math.sqrt(
        Math.pow(x - diameter / 2, 2) + Math.pow(y - diameter / 2, 2)
      );
      if (distance <= diameter / 2) {
        // Paint the circle white
        this.bitmap.data[idx + 0] = 255; // Red channel
        this.bitmap.data[idx + 1] = 255; // Green channel
        this.bitmap.data[idx + 2] = 255; // Blue channel
        this.bitmap.data[idx + 3] = 255; // Alpha channel, 255 for full opacity
      }
    });

    const bufferbase = await picture.getBufferAsync(Jimp.MIME_PNG);
    console.timeEnd('Image Masking Time');

    console.time('Base Image Composition Time');
    const { width: baseWidth = 0, height: baseHeight = 0 } = await baseImage.metadata();

    const x = (baseWidth / 2) - (diameter / 2);
    const y = (baseHeight / 2) - (diameter / 2);

    const compositeResult = await baseImage
      .composite([{ input: bufferbase, top: y, left: x }])
      .jpeg({ quality: 50 })
      .toBuffer();

    const newbufferbase = Buffer.from(compositeResult);
    console.timeEnd('Base Image Composition Time');

    const baseUrl = await uploadToS3(newbufferbase, crypto.randomBytes(7).toString('hex') + ".png");
    console.log("baseUrl", baseUrl);

    console.time('Ears Processing');
    // Convert overlayImage to a buffer
    let overlayBuffer = await overlayImage.getBufferAsync(Jimp.MIME_PNG);

    // Resize and position the overlay image at the top inside of the circle
    const overlayDiameter = 300 / 2.5; // Sizing the overlay as 1/3 of the circle's diameter

    // Calculate the position for the top overlay
    const overlayX = Math.round(x + (diameter - overlayDiameter) / 2); // Horizontally centered within the circle
    const overlayY = Math.round(y + (diameter / 15)); // A little bit down from the top of the circle

    // Resize overlayBuffer using Sharp
    overlayBuffer = await sharp(overlayBuffer)
      .resize({ width: overlayDiameter })
      .png()
      .toBuffer();

    // Composite the overlay image onto the base image
    const finalBuffer = await sharp(newbufferbase)
      .composite([{ input: overlayBuffer, left: overlayX, top: overlayY }])
      .jpeg({ quality: 50 })
      .toBuffer();
    console.timeEnd('Ears Processing');

    try {
      const imageUrl = await uploadToS3(finalBuffer, crypto.randomBytes(16).toString('hex') + "temp.png");
      return { urlfinal: imageUrl, urlbase: baseUrl, x: overlayX, y: overlayY, w: overlayDiameter };
    } catch (error) {
      console.error('Error calling uploadToS3:', error);
    }
    return { urlfinal: "https://foxears.vercel.app/2.png", urlbase: "baseUrl", x: overlayX, y: overlayY, w: overlayDiameter };
  } catch (error) {
    console.error('Error overlaying images:', error);
    throw new Error('Image overlay failed');
  }
}


/* export async function overlayImages(baseImagePath: string, overlayImagePath: string, outputFileName: string, options: OverlayOptions = {}): Promise<ImageDetails> {
  try {
    // Load base and overlay images using Jimp
    console.time('Image Processing Time 1');

    console.time('Image loading Time All');
    const [baseImage, picture, overlayImage] = await Promise.all([
      Jimp.read(path.resolve('public/3.png')),
      Jimp.read(overlayImagePath),
      Jimp.read(path.resolve('public/ears.png'))
    ]);
    console.timeEnd('Image loading Time All');

    console.time('Image Resize Time');
    // Scale down the picture (example: scale to 100x100)
    picture.resize(300, Jimp.AUTO);
    // Determine the smallest dimension (width or height)
    const size = Math.min(picture.getWidth(), picture.getHeight());

    // Crop the image to make it square from the top
    const croppedImage = picture.crop(0, 0, size, size);
    console.timeEnd('Image Resize Time');

    console.time('Image Masking Time');
    // Create a circle mask with full transparency
    const diameter = croppedImage.getWidth();
    const mask = new Jimp(diameter, diameter, 0x00000000); // Fully transparent

    // Draw a white circle on the mask
    mask.scan(0, 0, diameter, diameter, function (x, y, idx) {
      const distance = Math.sqrt(
        Math.pow(x - diameter / 2, 2) + Math.pow(y - diameter / 2, 2)
      );
      if (distance <= diameter / 2) {
        // Paint the circle white
        this.bitmap.data[idx + 0] = 255; // Red channel
        this.bitmap.data[idx + 1] = 255; // Green channel
        this.bitmap.data[idx + 2] = 255; // Blue channel
        this.bitmap.data[idx + 3] = 255; // Alpha channel, 255 for full opacity
      }
    });

    // Apply the circle mask onto the picture to cut out the circular area
    croppedImage.mask(mask, 0, 0);
    console.timeEnd('Image Masking Time');
    // Calculate the position to center the circle on the base image
    const x = (baseImage.bitmap.width / 2) - (diameter / 2);
    const y = (baseImage.bitmap.height / 2) - (diameter / 2);
    console.time('Image Composite Time');
    // Composite the picture onto the base image at the calculated position
    baseImage.composite(croppedImage, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
      opacityDest: 1
    });
    baseImage.quality(50);
    console.timeEnd('Image Composite Time');
    //Upload base image
    console.time('Image Buffer Time');
    const bufferbase = await baseImage.getBufferAsync(Jimp.MIME_JPEG);
    console.timeEnd('Image Buffer Time');
    const newbufferbase = Buffer.from(bufferbase);
    console.timeEnd('Image Processing Time 1');

    const baseUrl = await uploadToS3(newbufferbase, crypto.randomBytes(7).toString('hex') + ".png");

    // Resize and position the overlay image at the top inside of the circle
    const overlayDiameter = 300 / 2.5; // Sizing the overlay as 1/3 of the circle's diameter
    overlayImage.resize(overlayDiameter, Jimp.AUTO); // Maintain aspect ratio

    // Calculate the position for the top overlay
    const overlayX = x + (diameter - overlayDiameter) / 2; // Horizontally centered within the circle
    const overlayY = y + (diameter / 15); // A little bit down from the top of the circle

    // Composite the overlay image onto the base image
    baseImage.composite(overlayImage, overlayX, overlayY);
    baseImage.quality(50);
    // Save the composite image to a buffer
    const buffer = await baseImage.getBufferAsync(Jimp.MIME_PNG);
    const newbuffer = Buffer.from(buffer);
    try {
      const imageUrl = await uploadToS3(newbuffer, crypto.randomBytes(16).toString('hex') + "temp.png");
      return { urlfinal: imageUrl, urlbase: baseUrl, x: overlayX, y: overlayY, w: overlayDiameter };
    } catch (error) {
      console.error('Error calling uploadToS3:', error);
    }
    return { urlfinal: "https://mframes.vercel.app/2.png", urlbase: "baseUrl", x: overlayX, y: overlayY, w: overlayDiameter };
  } catch (error) {
    console.error('Error overlaying images:', error);
    throw new Error('Image overlay failed');
  }
} */