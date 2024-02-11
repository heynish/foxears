import {
    FrameRequest,
    getFrameMessage,
    getFrameHtmlResponse,
} from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';

async function getResponse(req: NextRequest): Promise<NextResponse> {
    console.time('Total Move Handling Time');
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

        const urlBase = searchParams.get('url') ?? 'https://mframes.vercel.app/3.png';
        const xParam = searchParams.get('x') ?? '261.83333333333337';
        const yParam = searchParams.get('y') ?? '100.76666666666667';
        const width = searchParams.get('width') ?? '125';

        let xFloat = parseFloat(xParam);
        let yFloat = parseFloat(yParam);
        let iWidth = parseFloat(width);

        switch (buttonId) {
            case 3:
                const postURLBack = `${process.env.HOST}/api/masks/choice?url=${urlBase}&x=${xFloat}&y=${yFloat}&width=${iWidth}`;
                console.timeEnd('Total Move Handling Time');
                return new NextResponse(getFrameHtmlResponse({
                    buttons: [
                        { label: '↔️ Left/Right' },
                        { label: '↕️ Up/Down' },
                        { label: '🫧 Resize' },
                    ],
                    image: `${process.env.HOST}/api/masks/image?url=${urlBase}&x=${xFloat}&y=${yFloat}&width=${iWidth}`,
                    post_url: postURLBack,
                }));
                break;
            case 1:
                yFloat -= 10;
                break;
            case 2:
                yFloat += 10;
                break;
            default:
                throw new Error('Invalid button ID.');
        }

        const postURLLeft = `${process.env.HOST}/api/masks/moveud?url=${urlBase}&x=${xFloat}&y=${yFloat}&width=${iWidth}`;
        console.timeEnd('Total Move Handling Time');
        return new NextResponse(getFrameHtmlResponse({
            buttons: [
                { label: '⬆ Up' },
                { label: '⬇ Down' },
                { label: 'Back' }
            ],
            image: `${process.env.HOST}/api/masks/image?url=${urlBase}&x=${xFloat}&y=${yFloat}&width=${iWidth}`,
            post_url: postURLLeft,
        }));

    } catch (error) {
        console.error('An error occurred:', error);
        return new NextResponse('An error occurred', { status: 500 });
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    return getResponse(req);
}

export const dynamic = 'force-dynamic';