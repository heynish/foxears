import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Extend the NodeJS global type with the s3Client property
declare global {
  var s3Client: S3Client | undefined;
}

// Singleton S3Client instance
let s3Client = global.s3Client || new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Store the instance in the global if it's not already there
if (!global.s3Client) {
  global.s3Client = s3Client;
}

export async function uploadToS3(buffer: Buffer, fileName: string): Promise<string> {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
    Body: buffer,
    ContentType: 'image/png', // make sure this matches your file type
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    const imageUrl = `https://${uploadParams.Bucket}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${encodeURIComponent(fileName)}`;
    return imageUrl.toString();
  } catch (err) {
    console.error('Failed to upload image to S3', err);
    throw err;
  }
}

// To avoid TypeScript errors, add this somewhere in your TypeScript definitions:
// This can be in a .d.ts file where you keep custom type declarations.

declare global {
  var s3Client: S3Client | undefined;
}

export default s3Client;

// Then ensure that your custom type declaration file is included in your tsconfig.json
/*
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

    return imageUrl.toString();
  } catch (err) {
    console.error('Failed to upload image to S3', err);
    throw err;
  }
}*/