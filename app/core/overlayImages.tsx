// utils/imageOverlay.ts
"use client"

import Jimp from 'jimp';
import { useState } from "react";
import { useS3Upload } from "next-s3-upload";
import fs from 'fs';

export interface OverlayOptions {
  x?: number; // X-coordinate of the overlay position (default: 0)
  y?: number; // Y-coordinate of the overlay position (default: 0)
}

export async function overlayImages(baseImagePath: string, overlayImagePath: string, outputFileName: string, options: OverlayOptions = {}): Promise<string> {
  try {
    // Load base and overlay images using Jimp
    const baseImage = await Jimp.read(baseImagePath);
    const overlayImage = await Jimp.read(overlayImagePath);

    //s3 upload
    let [imageUrl, setImageUrl] = useState();
    let { FileInput, openFileDialog, uploadToS3 } = useS3Upload();

    // Set default options if not provided
    const { x = 0, y = 0 } = options;

    // Overlay the images at the specified coordinates
    baseImage.composite(overlayImage, x, y);

    // Save the composite image to a buffer
    const buffer = await baseImage.getBufferAsync(Jimp.MIME_JPEG);
    const blob = new Blob([buffer]);
    const file = new File([blob], "name");


    let { url } = await uploadToS3(file);
    console.log(url);
  

    // Return the path to the temporary file
    return url;
  } catch (error) {
    console.error('Error overlaying images:', error);
    throw new Error('Image overlay failed');
  }
}
