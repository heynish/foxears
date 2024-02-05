import Jimp from 'jimp';
import { uploadToS3 } from './uploadToS3';
import crypto from 'crypto';
import ImageDetails from '../core/imageData';

export interface OverlayOptions {
  x?: number; // X-coordinate of the overlay position (default: 0)
  y?: number; // Y-coordinate of the overlay position (default: 0)
}


export async function moveImage(baseImagePath: string, x: number, y: number, w: number, options: OverlayOptions = {}): Promise<ImageDetails> {
  try {
    // Load base and overlay images using Jimp
    const baseImage = await Jimp.read(baseImagePath);
    const overlayUrl = 'https://mframes.vercel.app/ears.png';

    // Optimization: Load the overlay image only if the URL is provided
    if (!overlayUrl) throw new Error('Overlay URL not provided');

    const overlayImage = await Jimp.read(overlayUrl);

    /*
    // Optimization: Use constants for fixed values
    const CIRCLE_DIAMETER_RATIO = 1 / 3;
    const overlayDiameter = 300 * CIRCLE_DIAMETER_RATIO; // Sizing the overlay as 1/3 of the circle's diameter
*/
    // Resize and position the overlay image
    overlayImage.resize(w, Jimp.AUTO); // Maintain aspect ratio

    // Optimization: Removed redundant object property assignments
    // Composite the overlay image onto the base image
    baseImage.composite(overlayImage, x, y);

    // Save the composite image to a buffer and upload directly to S3
    const filename = crypto.randomBytes(16).toString('hex') + "temp.png";
    const imageUrl = await baseImage.getBufferAsync(Jimp.MIME_PNG)
      .then(buffer => uploadToS3(buffer, filename))
      .catch(error => {
        console.error('Error calling uploadToS3:', error);
        throw error; // Re-throw to be caught by the outer catch block
      });

    return { urlfinal: imageUrl, urlbase: "baseUrl", x, y, w };

  } catch (error) {
    console.error('Error overlaying images:', error);
    throw new Error('Image overlay failed');
  }
}

/*
import Jimp from 'jimp';
import { uploadToS3 } from './uploadToS3';
import crypto from 'crypto';
import ImageDetails from '../core/imageData';

export interface OverlayOptions {
  x?: number; // X-coordinate of the overlay position (default: 0)
  y?: number; // Y-coordinate of the overlay npm i canvas@2.6.1position (default: 0)
}


export async function moveImage(baseImagePath: string, x: number, y: number, options: OverlayOptions = {}): Promise<ImageDetails> {
  try {
    // Load base and overlay images using Jimp
    const baseImage = await Jimp.read(baseImagePath);
    const overlayImage = await Jimp.read('https://mframes.vercel.app/ears.png');

    // Resize and position the overlay image at the top inside of the circle
    const overlayDiameter = 250 / 3; // Sizing the overlay as 1/3 of the circle's diameter
    overlayImage.resize(overlayDiameter, Jimp.AUTO); // Maintain aspect ratio

    // Calculate the position for the top overlay
    const overlayX = x;
    const overlayY = y;
    console.log("2.2.1", x, y);
    // Composite the overlay image onto the base image
    baseImage.composite(overlayImage, overlayX, overlayY);

    // Save the composite image to a buffer
    const buffer = await baseImage.getBufferAsync(Jimp.MIME_PNG);
    const newbuffer = Buffer.from(buffer);
    try {
      const imageUrl = await uploadToS3(newbuffer, crypto.randomBytes(16).toString('hex') + "temp.png");
      return { urlfinal: imageUrl, urlbase: "baseUrl", x: overlayX, y: overlayY };
    } catch (error) {
      console.error('Error calling uploadToS3:', error);
    }
    return { urlfinal: "https://mframes.vercel.app/2.png", urlbase: "baseUrl", x: 0, y: 0 };
  } catch (error) {
    console.error('Error overlaying images:', error);
    throw new Error('Image overlay failed');
  }
}*/

/*
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
    });*/



/*
    //Detection Mask
    // Load the original image and crown using Jimp
  const [originalImage, crownImage] = await Promise.all([
    Jimp.read(buffer),
    Jimp.read('https://mframes.vercel.app/ears.png'), // Replace with the path to your crown image
  ]);

  const image = await canvas.loadImage(buffer) as unknown as HTMLImageElement;
 try {
  // Run face detection
    const detections = await faceapi.detectSingleFace(image).withFaceLandmarks();
  } catch (error) {
    console.error(error);
    // Handle the error appropriately
    // For example, you might want to return null or throw a custom error
  }
  // Run face detection
  //const detections = await faceapi.detectAllFaces(canvas).withFaceLandmarks();
  //const detections = await faceapi.detectSingleFace(tensor).withFaceLandmarks();

  console.log('detections complete');
 
  // For each detection, add the crown
  if (detections) {
    const { landmarks } = detections;
    const jawline = landmarks.getJawOutline();
    const nose = landmarks.getNose();

    // Calculate position and size for the crown (you might need to adjust these)
    const crownWidth = jawline[jawline.length - 1].x - jawline[0].x;
    const crownHeight = crownWidth * (crownImage.getHeight() / crownImage.getWidth());
    const xOffset = (jawline[0].x + jawline[jawline.length - 1].x) / 2 - crownWidth / 2;
    const yOffset = nose[0].y - crownHeight - 20; // Adjust Y offset as needed

    console.log('crownWidth', crownWidth);
    console.log('crownHeight', crownHeight);
    console.log('xOffset', xOffset);
    console.log('yOffset', yOffset);
    // Resize and composite the crown onto the original image
    crownImage.resize(crownWidth, crownHeight);
    originalImage.composite(crownImage, xOffset, yOffset);
  };

  // Convert the Jimp image back to a buffer
  //const crownedImageBuffer = await originalImage.getBufferAsync(Jimp.MIME_PNG);
*/

