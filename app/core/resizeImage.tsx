import Jimp from 'jimp';
import { uploadToS3 } from './uploadToS3';
import crypto from 'crypto';
import ImageDetails from '../core/imageData';

export interface OverlayOptions {
    x?: number; // X-coordinate of the overlay position (default: 0)
    y?: number; // Y-coordinate of the overlay position (default: 0)
}


export async function resizeImage(baseImagePath: string, x: number, y: number, w: number, options: OverlayOptions = {}): Promise<ImageDetails> {
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
        const imageUrl = await baseImage.getBufferAsync(Jimp.MIME_JPEG)
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