import {
  FrameRequest,
  getFrameAccountAddress,
  getFrameMessage,
  getFrameHtmlResponse,
} from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { moveImage } from '../../../core/moveImage';
import ImageDetails from '../../../core/imageData';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Get the URL object from the request
  const { searchParams } = req.nextUrl;

  const response = await req.json();
  const body: FrameRequest = response;
  const { isValid, message } = await getFrameMessage(body);
  if (isValid) {
    try {
    } catch (err) {
      console.error(err);
    }
  }
  const buttonId = message?.buttonIndex || 0;
  console.log('1.2 buttonId', buttonId);

  // Extracting individual query parameters
  const urlParam = searchParams.get('url');
  const xParam = searchParams.get('x');
  const yParam = searchParams.get('y');

  // Example usage of the extracted parameters
  console.log(`URL Parameter: ${urlParam}`);
  console.log(`X Parameter: ${xParam}`);
  console.log(`Y Parameter: ${yParam}`);

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
  console.log("1.4", postURL);

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

export const dynamic = 'force-dynamic';
