import Jimp from 'jimp';
import { uploadToS3 } from './uploadToS3';
import crypto from 'crypto';
//import * as canvas from 'canvas';
//import * as faceapi from 'face-api.js';
//import * as tf from '@tensorflow/tfjs-node';

//const { Canvas, Image, ImageData } = canvas
//faceapi.env.monkeyPatch({ Canvas, Image, ImageData } as any)

export interface OverlayOptions {
  x?: number; // X-coordinate of the overlay position (default: 0)
  y?: number; // Y-coordinate of the overlay npm i canvas@2.6.1position (default: 0)
}


export async function overlayImages(baseImagePath: string, overlayImagePath: string, outputFileName: string, options: OverlayOptions = {}): Promise<string> {
  try {
    // Load base and overlay images using Jimp
    const baseImage = await Jimp.read(baseImagePath);
    const picture = await Jimp.read(overlayImagePath);
    const overlayImage = await Jimp.read('https://mframes.vercel.app/ears.png');
    // Load face-api models
  //await faceapi.nets.tinyFaceDetector.loadFromDisk('/models');
  //await faceapi.nets.tinyFaceDetector.loadFromUri('https://mframes.vercel.app/models');
  //await faceapi.nets.faceLandmark68TinyNet.loadFromUri('https://mframes.vercel.app/models');
  //await faceapi.nets.faceLandmark68Net.loadFromDisk('/models');

  // Scale down the picture (example: scale to 100x100)
  picture.resize(250, Jimp.AUTO);
    // Determine the smallest dimension (width or height)
    const size = Math.min(picture.getWidth(), picture.getHeight());

    // Crop the image to make it square from the top
    const croppedImage = picture.crop(0, 0, size, size);


  // Create a circle mask with full transparency
const diameter = croppedImage.getWidth();
const mask = new Jimp(diameter, diameter, 0x00000000); // Fully transparent

// Draw a white circle on the mask
mask.scan(0, 0, diameter, diameter, function(x, y, idx) {
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

    // Calculate the position to center the circle on the base image
    const x = (baseImage.bitmap.width / 2) - (diameter / 2);
    const y = (baseImage.bitmap.height / 2) - (diameter / 2);

    // Composite the picture onto the base image at the calculated position
    baseImage.composite(croppedImage, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
      opacityDest: 1
    });

    // Resize and position the overlay image at the top inside of the circle
    const overlayDiameter = diameter / 3; // Sizing the overlay as 1/3 of the circle's diameter
    overlayImage.resize(overlayDiameter, Jimp.AUTO); // Maintain aspect ratio

    // Calculate the position for the top overlay
    const overlayX = x + (diameter - overlayDiameter) / 2; // Horizontally centered within the circle
    const overlayY = y + (diameter / 15); // A little bit down from the top of the circle

    // Composite the overlay image onto the base image
    baseImage.composite(overlayImage, overlayX, overlayY);


    console.log('Calling buffer');
    // Save the composite image to a buffer
    const buffer = await baseImage.getBufferAsync(Jimp.MIME_PNG);



   
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