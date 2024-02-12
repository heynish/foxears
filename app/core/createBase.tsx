import Jimp from 'jimp';
import { uploadToS3 } from './uploadToS3';
import crypto from 'crypto';
import axios from 'axios';
import sharp from 'sharp'

export async function createBase(overlayImagePath: string): Promise<string> {
    try {
        const response = await axios.get(overlayImagePath, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');

        // Create a circular mask
        const roundedCorners = Buffer.from(
            `<svg><rect x="0" y="0" width="300" height="300" rx="150" ry="150"/></svg>`
        );

        // Resize and apply mask
        const image = await sharp(imageBuffer)
            .resize(300, 300, { fit: 'cover', position: 'center' })
            .composite([
                {
                    input: roundedCorners,
                    blend: 'dest-in'
                }
            ])
            .png()
            .toBuffer();

        // Create a new sharp object for background
        const background = sharp({
            create: {
                width: 800,
                height: 418,
                channels: 4,
                background: { r: 3, g: 125, b: 214, alpha: 1 }
            }
        }).png();

        // Calculate center position
        const left = 250;
        const top = 59;

        // Composite the image onto the background
        const output = await background
            .composite([{ input: image, left: left, top: top }])
            .toBuffer();

        return await uploadToS3(output, crypto.randomBytes(7).toString('hex') + ".png");

    } catch (error) {
        console.error('Error overlaying images:', error);
        throw new Error('Image overlay failed');
    }
}