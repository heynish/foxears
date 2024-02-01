// pages/api/overlayImages.ts

import { NextApiRequest, NextApiResponse } from 'next';
import Jimp from 'jimp';
import fs from 'fs';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Ensure the request method is POST
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    // Ensure background and overlay image paths are provided in the request body
    const { backgroundImage, overlayImage } = req.body;
    if (!backgroundImage || !overlayImage) {
      res.status(400).json({ error: 'Missing image paths' });
      return;
    }

    // Read background and overlay images
    const backgroundImageBuffer = await Jimp.read(backgroundImage);
    const overlayImageBuffer = await Jimp.read(overlayImage);

    // Composite overlay image on top of background image
    backgroundImageBuffer.composite(overlayImageBuffer, 0, 0);

    // Save the resulting image
    const outputPath = 'public/output.jpg'; // Adjust the output path as needed
    await writeFileAsync(outputPath, await backgroundImageBuffer.getBufferAsync('image/jpeg'));

    // Return the path to the resulting image
    res.status(200).json({ outputPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
