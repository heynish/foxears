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
            label: 'Find me a dapp to try',
        },
    ],
    image: `https://mframes.vercel.app/dappsimage/main.png`,
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

export default function Home() {
    return (

        <main className={`${dmsans.className} responsivePadding`}
            style={{
                backgroundColor: '#121212',
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
                    right: 0
                }}
            />
            <img src="/dappsimage/overlay2.webp"
                style={{
                    position: 'absolute',
                    bottom: 60,
                    left: 0
                }}
            />
            <Explorer />

            <style jsx>{`
        .responsivePadding {
            padding: 60px;
        }

        @media screen and (max-width: 768px) {
            .responsivePadding {
                padding-left: 16px;
                padding-right: 16px;
            }
        }
    `}</style>
        </main>
    );
}
