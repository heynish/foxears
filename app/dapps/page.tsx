import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import Image from 'next/image';
import Head from 'next/head';

const frameMetadata = getFrameMetadata({
    buttons: [
        {
            label: 'Find me a dapp to try',
        },
    ],
    image: `https://mframes.vercel.app/linea.png`,
    post_url: `https://mframes.vercel.app/api/dapps`,
});

export const metadata: Metadata = {
    metadataBase: new URL('https://mframes.vercel.app/dapps'),
    title: 'Try a dapp',
    description: 'Try a dapp',
    openGraph: {
        title: 'Try a dapp',
        description: 'Try a dapp',
        images: ['https://mframes.vercel.app/dappsimage/main.png'],
    },
    other: {
        ...frameMetadata,
    },
};

export default function Page() {
    return (
        <>
            <Head>
                <link rel="shortcut icon" href="/image/favicon.ico" type="image/x-icon" />
                {/* Add any other meta tags, title, or links needed here */}
            </Head>
            <body>
                {/* Existing content */}
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
                        src='https://mframes.vercel.app/dappsimage/main.png'
                        alt='Background Image'
                        width={500}  // replace with the actual image width
                        height={300} // replace with the actual image height
                        layout='intrinsic'  // This ensures the image maintains its natural width and height
                    />
                    {/* Additional content */}
                </div>
            </body>
        </>
    );
}
