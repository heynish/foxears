import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(buffer: Buffer, fileName: string): Promise<string> {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
    Body: buffer,
    ContentType: 'image/png', // make sure this matches your file type
  };

  try {
    // Create a command to put the object in the S3 bucket
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    
    // Construct the URL of the uploaded image
    const imageUrl = `https://${uploadParams.Bucket}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${encodeURIComponent(fileName)}`;
    console.log('Successfully uploaded image to S3. Image URL:', imageUrl);
    
    return imageUrl.toString();
  } catch (err) {
    console.error('Failed to upload image to S3', err);
    throw err;
  }
}