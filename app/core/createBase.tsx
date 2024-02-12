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

        // Composite the image onto the background
        const output = await background
            .composite([{ input: image, left: 0, top: 0 }])
            .toBuffer();

        return await uploadToS3(output, crypto.randomBytes(7).toString('hex') + ".png");
        /*         // Fetch the image data
                console.time('Axios');
                console.log(overlayImagePath);
                const response = await axios.get(overlayImagePath, { responseType: 'arraybuffer' });
                // Convert the data to a Buffer
                const imageBuffer = Buffer.from(response.data, 'binary');
                console.timeEnd('Axios');
                console.time('Jimp');
                const picture = await Jimp.read(imageBuffer);
                console.timeEnd('Jimp');
        
                console.time('Mask');
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
        
                console.time('Final');
                // Create a new Jimp image with the specified dimensions and color
                const background = new Jimp(800, 418, 0x037DD6ff
                );
        
                // Calculate the position to center the circle on the base image
                const x = (background.bitmap.width / 2) - (diameter / 2);
                const y = (background.bitmap.height / 2) - (diameter / 2);
        
                // Composite the picture onto the base image at the calculated position
                background.composite(croppedImage, x, y);
        
                const bufferbase = await background.getBufferAsync(Jimp.MIME_JPEG);
                console.timeEnd('Final');
                return await uploadToS3(bufferbase, crypto.randomBytes(7).toString('hex') + ".png"); */

    } catch (error) {
        console.error('Error overlaying images:', error);
        throw new Error('Image overlay failed');
    }
}