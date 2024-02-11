import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import Head from 'next/head';
import Explorer from './Explorer';
import { DM_Sans } from '@next/font/google'

const dmsans = DM_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '700'],
});

const frameMetadata = getFrameMetadata({
    buttons: [
        {
            label: 'Explore a dapp',
        },
    ],
    image: `https://mframes.vercel.app/dappsimage/main.png`,
    post_url: `https://mframes.vercel.app/api/dapps`,
});

export const metadata: Metadata = {
    metadataBase: new URL('https://mframes.vercel.app/dapps'),
    title: 'Dapp Explorer',
    description: 'Dapp Explorer',
    openGraph: {
        title: 'Dapp Explorer',
        description: 'Dapp Explorer',
        images: ['https://mframes.vercel.app/dappsimage/main.png'],
    },
    other: {
        ...frameMetadata,
    },
};

export default function Home() {
    return (
        <main className={dmsans.className}
            style={{
                backgroundColor: '#121212',
                paddingTop: '60px',
                paddingLeft: '16px',
                paddingRight: '16px',
                height: '100vh',
                position: 'relative', // this is needed for absolute positioning of child elements
            }}
        >
            <Head>
                <link rel="shortcut icon" href="/dappsimage/favicon.ico" type="image/x-icon" />
            </Head>
            <img src="/dappsimage/overlay.webp"
                style={{
                    position: 'absolute',
                    top: 0,
                    right: -30
                }}
            />
            <img src="/dappsimage/overlay2.webp"
                style={{
                    position: 'absolute',
                    bottom: 30,
                    left: 0
                }}
            />
            <Explorer />
        </main>
    );
}
