import {
    FrameRequest,
    getFrameMessage,
    getFrameHtmlResponse,
} from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';

async function getResponse(req: NextRequest): Promise<NextResponse> {
    console.time('Total Choice Handling Time');
    // Extract query parameters from the request URL
    const { searchParams } = req.nextUrl;

    let buttonId: number | undefined;

    try {
        const body: FrameRequest = await req.json();
        const { isValid, message } = await getFrameMessage(body);

        if (!isValid) {
            throw new Error('Invalid message received.');
        }

        buttonId = message.button || 1;

        const urlBase = searchParams.get('url') ?? `${process.env.HOST}/3.png`;
        const xParam = searchParams.get('x') ?? '261.83333333333337';
        const yParam = searchParams.get('y') ?? '100.76666666666667';
        const width = searchParams.get('width') ?? '125';

        const postLRURL = `${process.env.HOST}/api/masks/movelr?url=${urlBase}&x=${xParam}&y=${yParam}&width=${width}`;
        const postUDURL = `${process.env.HOST}/api/masks/moveud?url=${urlBase}&x=${xParam}&y=${yParam}&width=${width}`;
        const postRSURL = `${process.env.HOST}/api/masks/movers?url=${urlBase}&x=${xParam}&y=${yParam}&width=${width}`;
        const imgURL = `${process.env.HOST}/api/masks/image?url=${urlBase}&x=${xParam}&y=${yParam}&width=${width}`;
        console.timeEnd('Total Choice Handling Time');

        switch (buttonId) {
            case 1:
                return new NextResponse(getFrameHtmlResponse({
                    buttons: [
                        { label: 'Back' },
                        { label: '◀️ Left' },
                        { label: 'Right ▶️' }
                    ],
                    image: imgURL,
                    post_url: postLRURL,
                }));
                break;
            case 2:
                return new NextResponse(getFrameHtmlResponse({
                    buttons: [
                        { label: 'Back' },
                        { label: '⬆ Up' },
                        { label: '⬇ Down' }
                    ],
                    image: imgURL,
                    post_url: postUDURL,
                }));
                break;
            case 3:
                return new NextResponse(getFrameHtmlResponse({
                    buttons: [
                        { label: 'Back' },
                        { label: '◀️ Smaller' },
                        { label: 'Bigger ▶️' }
                    ],
                    image: imgURL,
                    post_url: postRSURL,
                }));
                break;
            default:
                throw new Error('Invalid button ID.');
        }

    } catch (error) {
        console.error('An error occurred:', error);
        return new NextResponse('An error occurred', { status: 500 });
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    return getResponse(req);
}

export const dynamic = 'force-dynamic';