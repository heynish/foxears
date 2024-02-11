import Jimp from 'jimp';
import { uploadToS3 } from './uploadToS3';
import crypto from 'crypto';
import path from 'path';

export async function createBase(overlayImagePath: string): Promise<string> {
    try {

        console.time('Mask');
        const picture = await Jimp.read(overlayImagePath);
        picture.resize(300, Jimp.AUTO);
        const size = Math.min(picture.getWidth(), picture.getHeight());
        const croppedImage = picture.crop(0, 0, size, size);
        const diameter = 300;
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
        const background = new Jimp(800, 418, 0x037DD6ff
        );

        // Calculate the position to center the circle on the base image
        const x = (800 / 2) - (diameter / 2);
        const y = (418 / 2) - (diameter / 2);

        // Composite the picture onto the base image at the calculated position
        background.composite(croppedImage, x, y, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: 1,
            opacityDest: 1
        });

        const bufferbase = await background.getBufferAsync(Jimp.MIME_JPEG);
        return await uploadToS3(bufferbase, crypto.randomBytes(7).toString('hex') + ".png");

    } catch (error) {
        console.error('Error overlaying images:', error);
        throw new Error('Image overlay failed');
    }
}