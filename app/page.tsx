import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import Image from 'next/image';
import Head from 'next/head';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: '🦊 Lets go',
    },
  ],
  image: `${process.env.HOST}/1.png`,
  post_url: `${process.env.HOST}/api/masks`,
});

export const metadata: Metadata = {
  metadataBase: new URL(`${process.env.HOST}`),
  title: 'Fox Yourself',
  description: 'Get a mask',
  openGraph: {
    title: 'Fox Yourself',
    description: 'Get a mask',
    images: `${process.env.HOST}/1.png`,
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <body>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          position: 'relative' // Needed for next/image to work properly
        }}>
          <Image
            src={`${process.env.HOST}/1.png`}
            alt='Background Image'
            width={500}  // replace with the actual image width
            height={300} // replace with the actual image height
            layout='intrinsic'  // This ensures the image maintains its natural width and height
          />
        </div>
      </body>
    </>
  );
}
