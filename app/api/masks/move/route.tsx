import {
    FrameRequest,
    getFrameAccountAddress,
    getFrameMessage,
    getFrameHtmlResponse,
  } from '@coinbase/onchainkit';
  import { USER_DATA_TYPE, UserData } from "../../../farcaster/user";
  import { NextRequest, NextResponse } from 'next/server';
  import { overlayImages } from '../../../core/overlayImages';
  import ImageDetails from '../../../core/imageData';
  
  async function getResponse(req: NextRequest): Promise<NextResponse> {

    const body: FrameRequest = await req.json();
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

      // Extract query parameters from the request
  const queryParams = req.nextUrl.searchParams;

  // Parse the image URL and coordinates from the query params
  const imageUrl = queryParams.get('imageUrl');
  const positionX = parseInt(queryParams.get('positionX') || '0', 10);
  const positionY = parseInt(queryParams.get('positionY') || '0', 10);

  console.log('imageUrl in move', imageUrl);
  console.log('positionX in move', positionX);
  console.log('positionY in move', positionY);

  // Construct the result object based on the extracted parameters
  const result: ImageDetails = {
    url: imageUrl || 'defaultImageUrl', // Provide a default or handle the absence of imageUrl appropriately
    x: positionX,
    y: positionY
  };
  
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
  