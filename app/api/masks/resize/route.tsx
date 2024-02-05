import {
  FrameRequest,
  getFrameMessage,
  getFrameHtmlResponse,
} from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { resizeImage } from '../../../core/resizeImage';
import ImageDetails from '../../../core/imageData';

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

    let urlFinal = searchParams.get('urlfinal') ?? 'https://mframes.vercel.app/3.png';
    const urlBase = searchParams.get('url') ?? 'https://mframes.vercel.app/3.png';
    const xParam = searchParams.get('x') ?? '261.83333333333337';
    const yParam = searchParams.get('y') ?? '100.76666666666667';
    const width = searchParams.get('width') ?? '125';

    let xFloat = parseFloat(xParam);
    let yFloat = parseFloat(yParam);
    let iWidth = parseFloat(width);

    switch (buttonId) {
      case 1:
        const postURLBack = `https://mframes.vercel.app/api/masks/choice?urlfinal=${urlFinal}&url=${urlBase}&x=${xFloat}&y=${yFloat}&width=${iWidth}`;
        console.timeEnd('Total Move Handling Time');
        return new NextResponse(getFrameHtmlResponse({
          buttons: [
            { label: '↔️ Left/Right' },
            { label: '↕️ Up/Down' },
            { label: '🫧 Resize' },
          ],
          image: urlFinal,
          post_url: postURLBack,
        }));
        break;
      case 2:
        iWidth -= 5;
        break;
      case 3:
        iWidth += 5;
        break;
      default:
        throw new Error('Invalid button ID.');
    }

    const { urlfinal, x, y, w }: ImageDetails = await resizeImage(urlBase, xFloat, yFloat, iWidth, {
      x: 50, // Overlay position X-coordinate
      y: 50, // Overlay position Y-coordinate
    });
    urlFinal = urlfinal;
    xFloat = x;
    yFloat = y;
    iWidth = w;
    const postURLSize = `https://mframes.vercel.app/api/masks/movers?urlfinal=${urlFinal}&url=${urlBase}&x=${xFloat}&y=${yFloat}&width=${iWidth}`;
    console.timeEnd('Total Move Handling Time');
    return new NextResponse(getFrameHtmlResponse({
      buttons: [
        { label: 'Back' },
        { label: '◀️ Smaller' },
        { label: 'Bigger ▶️' }
      ],
      image: urlFinal,
      post_url: postURLSize,
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