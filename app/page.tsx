import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Try Me 🦊',
    },
  ],
  image: `https://mframes.vercel.app/1.png`,
  post_url: `https://mframes.vercel.app/api/masks`,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mframes.vercel.app'),
  title: 'MetaMask Masks',
  description: 'See my masks',
  openGraph: {
    title: 'MetaMask Masks',
    description: 'See my masks',
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
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        {/* Add any other meta tags, title, or links needed here */}
      </head>
      <body>
        {/* Existing content */}
        <img
          src='https://mframes.vercel.app/1.png'
          style={{
            height: '100vh', // Viewport height
            width: '100vw', // Viewport width
            objectFit: 'cover', // Cover the viewport
            position: 'absolute', // Position it over the page content
            top: 0,
            left: 0,
            zIndex: -1 // Keep it behind other content
          }}
        />
      </body>
    </>
  );
}
