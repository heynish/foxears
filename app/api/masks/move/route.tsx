import {
  FrameRequest,
  getFrameMessage,
  getFrameHtmlResponse,
} from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { moveImage } from '../../../core/moveImage';
import ImageDetails from '../../../core/imageData';

async function getResponse(req: NextRequest): Promise<NextResponse> {
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

    let xFloat = parseFloat(xParam);
    let yFloat = parseFloat(yParam);

    switch (buttonId) {
      case 1:
        xFloat -= 5;
        break;
      case 2:
        xFloat += 5;
        break;
      case 3:
        yFloat -= 5;
        break;
      case 4:
        yFloat += 5;
        break;
      default:
        throw new Error('Invalid button ID.');
    }

    const { urlfinal, x, y }: ImageDetails = await moveImage(urlBase, xFloat, yFloat, {
      x: 50, // Overlay position X-coordinate
      y: 50, // Overlay position Y-coordinate
    });

    const postURL = `https://mframes.vercel.app/api/masks/move?url=${urlBase}&x=${x}&y=${y}`;

    return new NextResponse(getFrameHtmlResponse({
      buttons: [
        { label: '◀️ Left' },
        { label: 'Right ▶️' },
        { label: '⬆ Up' },
        //{ label: '⬇ Down' }
      ],
      image: urlfinal,
      post_url: postURL,
      refresh_period: 30,
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

/*
import {
  FrameRequest,
  getFrameMessage,
  getFrameHtmlResponse,
} from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { moveImage } from '../../../core/moveImage';
import ImageDetails from '../../../core/imageData';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Get the URL object from the request
  const { searchParams } = req.nextUrl;
  let buttonId: number | undefined = 1;

  const response = await req.json();
  const body: FrameRequest = response;
  const { isValid, message } = await getFrameMessage(body);
  if (isValid) {
    try {
      buttonId = message.button || 0;
    } catch (err) {
      console.error(err);
    }
  }

  console.log('2.1 buttonId', buttonId);

  // Extracting individual query parameters
  const urlParam = searchParams.get('url');
  const xParam = searchParams.get('x');
  const yParam = searchParams.get('y');

  const urlBase = urlParam || 'https://mframes.vercel.app/3.png';
  let xFloat: number;
  let yFloat: number;

  xFloat = parseFloat(xParam || '261.83333333333337');
  yFloat = parseFloat(yParam || '100.76666666666667');

  if (buttonId == 1) {
    xFloat = xFloat - 5;
  } else if (buttonId == 2) {
    xFloat = xFloat + 5;
  } else if (buttonId == 3) {
    yFloat = yFloat - 5;
  } else if (buttonId == 4) {
    yFloat = yFloat + 5;
  }


  const { urlfinal, urlbase, x, y }: ImageDetails = await moveImage(urlBase, xFloat, yFloat, {
    x: 50, // Set overlay position X-coordinate to 50
    y: 50, // Set overlay position Y-coordinate to 50
  });

  const postURL = 'https://mframes.vercel.app/api/masks/move?url=' + urlBase + '&x=' + x + '&y=' + y;
  console.log("2.3", postURL);

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          //label: `${accountAddress}`,
          label: `◀️ Left`,
        },
        {
          //label: `${accountAddress}`,
          label: `Right ▶️`,
        },
        {
          //label: `${accountAddress}`,
          label: `🔼 Up`,
        },
        {
          //label: `${accountAddress}`,
          label: `🔽 Down`,
        },
      ],
      image: urlfinal,
      post_url: postURL,
      refresh_period: 30,
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';*/
