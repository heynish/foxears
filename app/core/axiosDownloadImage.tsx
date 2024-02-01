import axios, { AxiosResponse } from 'axios';
import fs from 'fs';
import path from 'path';

export async function axiosDownloadImage(url: string, fileName: string): Promise<void> {
  try {
    console.log("Downloading Image");
    console.log(url);
    const response: AxiosResponse<Blob> = await axios.get(url, {
      responseType: 'blob',
    });

    console.log('converting to buffer');

    // Convert Blob to ArrayBuffer
    const arrayBuffer: ArrayBuffer = await response.data.arrayBuffer();

    // Convert ArrayBuffer to Buffer
    const buffer: Buffer = Buffer.from(arrayBuffer);

    console.log('Writing to public');

    // Create a file path to the public directory
    const publicPath = path.join(process.cwd(), 'public', fileName);

    // Write the image data to the public directory
    fs.writeFileSync(publicPath, buffer);

    console.log('Image downloaded and saved successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

