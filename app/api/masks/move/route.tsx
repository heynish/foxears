import {
    FrameRequest,
    getFrameAccountAddress,
    getFrameMessage,
    getFrameHtmlResponse,
  } from '@coinbase/onchainkit';
  import { NextRequest, NextResponse } from 'next/server';
  import { overlayImages } from '../../../core/overlayImages';
  import ImageDetails from '../../../core/imageData';
  
  async function getResponse(req: NextRequest): Promise<NextResponse> {
    // Get the URL object from the request
  const { searchParams } = req.nextUrl;

    const response = await req.json();
    const body: FrameRequest = response;
    const { isValid, message } = await getFrameMessage(body);
    if (isValid) {
      try {
           // Get the Farcaster ID from the message
        //FID = message.fid ?? 3;
        //accountAddress = await getFrameAccountAddress(message, { NEYNAR_API_KEY: 'NEYNAR_API_DOCS' });
        //console.log(accountAddress);
      } catch (err) {
        console.error(err);
      }
    }
    const buttonId = message?.buttonIndex || 0;
    console.log('buttonId', buttonId);
 
       // Extracting individual query parameters
  const urlParam = searchParams.get('url');
  const xParam = searchParams.get('x');
  const yParam = searchParams.get('y');

  // Example usage of the extracted parameters
  console.log(`URL Parameter: ${urlParam}`);
  console.log(`X Parameter: ${xParam}`);
  console.log(`Y Parameter: ${yParam}`);

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
        //image: pfp+'.jpg',
        image: 'https://mframes.vercel.app/1.png',
        post_url: 'https://mframes.vercel.app/api/masks/move',
      }),
    );
  /*
    return new NextResponse(`<!DOCTYPE html><html><head>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="https://mframes.vercel.app/2.png" />
      <meta property="fc:frame:button:1" content="${accountAddress}" />
      <meta property="fc:frame:post_url" content="https://mframes.vercel.app/api/masks" />
    </head></html>`);*/
  }
  
  
  export async function POST(req: NextRequest): Promise<Response> {
    return getResponse(req);
  }
  
  export const dynamic = 'force-dynamic';
  