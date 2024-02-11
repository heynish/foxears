import Jimp from 'jimp';
import { uploadToS3 } from './uploadToS3';
import crypto from 'crypto';
import ImageDetails from '../core/imageData';
import path from 'path';
import sharp from 'sharp';

export async function overlayImages(baseImagePath: string, overlayImagePath: string, outputFileName: string): Promise<ImageDetails> {
  try {

    console.time('Mask');
    const picture = await Jimp.read(overlayImagePath);
    picture.resize(300, Jimp.AUTO);
    const size = Math.min(picture.getWidth(), picture.getHeight());
    const croppedImage = picture.crop(0, 0, size, size);
    const diameter = croppedImage.getWidth();
    const mask = new Jimp(diameter, diameter, 0x00000000);

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
    console.timeEnd('Mask');

    // Create a new Jimp image with the specified dimensions and color
    const background = new Jimp(800, 410, 0x000000ff);

    // Calculate the position to center the circle on the base image
    const x = (background.bitmap.width / 2) - (diameter / 2);
    const y = (background.bitmap.height / 2) - (diameter / 2);
    console.time('Image Composite Time');
    // Composite the picture onto the base image at the calculated position
    background.composite(croppedImage, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
      opacityDest: 1
    });
    background.quality(50);

    const bufferbase = await background.getBufferAsync(Jimp.MIME_JPEG);
    const baseUrl = await uploadToS3(bufferbase, crypto.randomBytes(7).toString('hex') + ".png");


    const overlayImage = await Jimp.read(path.resolve('public/ears.png'));

    // Resize and position the overlay image at the top inside of the circle
    const overlayDiameter = 300 / 2.5; // Sizing the overlay as 1/3 of the circle's diameter
    overlayImage.resize(overlayDiameter, Jimp.AUTO); // Maintain aspect ratio

    // Calculate the position for the top overlay
    const overlayX = x + (diameter - overlayDiameter) / 2; // Horizontally centered within the circle
    const overlayY = y + (diameter / 15); // A little bit down from the top of the circle

    // Composite the overlay image onto the base image
    background.composite(overlayImage, overlayX, overlayY);
    background.quality(50);
    // Save the composite image to a buffer
    const newbuffer = await background.getBufferAsync(Jimp.MIME_PNG);

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