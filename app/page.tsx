import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Try Me',
    },
  ],
  image: `/next.svg`,
  post_url: `/api/frame`,
});

export const metadata: Metadata = {
  title: 'MetaMask Masks',
  description: 'See my masks',
  openGraph: {
    title: 'MetaMask Masks',
    description: 'See my masks',
    images: [`/next.svg`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <h1>MetaMask Masks</h1>
    </>
  );
}
