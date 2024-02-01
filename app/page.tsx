import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Try Me',
    },
  ],
  image: `https://mframes.vercel.app/mask.png`,
  post_url: `/api/frame`,
});

export const metadata: Metadata = {
  title: 'MetaMask Masks',
  description: 'See my masks',
  openGraph: {
    title: 'MetaMask Masks',
    description: 'See my masks',
    images: ['https://mframes.vercel.app/mask.png'],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <img src={'/mask.png'}/>
    </>
  );
}
