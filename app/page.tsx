import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import Image from 'next/image';
import prisma from './lib/prisma';
import s3Client from './core/uploadToS3';
import { SpeedInsights } from "@vercel/speed-insights/next"

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: '🦊 Lets go',
    },
  ],
  image: `https://mframes.vercel.app/1.png`,
  post_url: `https://mframes.vercel.app/api/masks`,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mframes.vercel.app'),
  title: 'Fox Yourself',
  description: 'Get a mask',
  openGraph: {
    title: 'Fox Yourself',
    description: 'Get a mask',
    images: ['https://mframes.vercel.app/1.png'],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <head>
        <link rel="shortcut icon" href="/image/favicon.ico" type="image/x-icon" />
        {/* Add any other meta tags, title, or links needed here */}
      </head>
      <body>
        {/* Existing content */}
        <div style={{
          position: 'relative',
          width: '100vw',
          height: '100vh', // Set the height to fill the viewport
          display: 'flex', // Use flexbox for centering
          justifyContent: 'center', // Center horizontally
          alignItems: 'center', // Center vertically
          overflow: 'hidden'
        }}>
          <Image
            src='https://mframes.vercel.app/1.png'
            alt='Background Image'
            layout='intrinsic'
            width={1920} // Actual width of the image
            height={1080} // Actual height of the image
            objectFit='cover'
            quality={100}
          />
          {/* Additional content that determines the height of the div */}
        </div>
      </body>
    </>
  );
}
