import axios, { AxiosResponse } from 'axios';
import fs from 'fs';
import path from 'path';

export async function axiosDownloadImage(url: string, fileName: string): Promise<void> {
  try {
    const response: AxiosResponse<Blob> = await axios.get(url, {
      responseType: 'blob',
    });

    // Convert Blob to ArrayBuffer
    const arrayBuffer: ArrayBuffer = await response.data.arrayBuffer();

    // Convert ArrayBuffer to Buffer
    const buffer: Buffer = Buffer.from(arrayBuffer);

    // Create a file path to the public directory
    const publicPath = path.join(process.cwd(), 'public', fileName);

    // Write the image data to the public directory
    fs.writeFileSync(publicPath, buffer);

    console.log('Image downloaded and saved successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

const imageUrl: string = 'http://example.com/image.jpg';
const imageName: string = 'my-image.jpg';

axiosDownloadImage(imageUrl, imageName);