import {
  FrameRequest,
  getFrameAccountAddress,
  getFrameMessage,
  getFrameHtmlResponse,
} from '@coinbase/onchainkit';
//import { getFrameAccountPFP } from '../../core/getFrameAccountPFP';
import { USER_DATA_TYPE, UserData } from "../../farcaster/user";
import { NextRequest, NextResponse } from 'next/server';

// Farcaster API
const HUBBLE_URL = "https://nemes.farcaster.xyz:2281/v1";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  let accountAddress: string | undefined = '';
  let accountPFP: string | undefined = '';
  let FID: number | undefined = 3;
  
  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body);
  if (isValid) {
    try {
         // Get the Farcaster ID from the message
      FID = message.fid ?? 3;
      accountAddress = await getFrameAccountAddress(message, { NEYNAR_API_KEY: 'NEYNAR_API_DOCS' });
      console.log(accountAddress);
    } catch (err) {
      console.error(err);
    }
  }


    // Get username and pfp
    const usernamePromise = fetch(
        `${HUBBLE_URL}/userDataByFid?fid=${FID}&user_data_type=${USER_DATA_TYPE.USERNAME}`
    );
    const pfpPromise = fetch(
        `${HUBBLE_URL}/userDataByFid?fid=${FID}&user_data_type=${USER_DATA_TYPE.PFP}`
    );
    const [usernameRes, pfpRes] = await Promise.all([usernamePromise, pfpPromise])
    const usernameData: UserData = await usernameRes.json();
    const username = usernameData.data.userDataBody.value;
    const pfpData: UserData = await pfpRes.json();
    const pfp = pfpData.data.userDataBody.value;
    console.log(pfp);
    
// Call the function with image paths
sendRequest('/1.png', '/2.png')
  .then((data) => {
    // Handle the response data
    console.log('Response data:', data);
  })
  .catch((error) => {
    // Handle error if necessary
    console.error('Error:', error);
  });

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          //label: `${accountAddress}`,
          label: `${pfp}`,
          action: 'post_redirect',
        },
      ],
      image:'https://mframes.vercel.app/2.png',
      post_url: 'https://mframes.vercel.app/api/masks/redirect',
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

async function sendRequest(backgroundImage: string, overlayImage: string): Promise<void> {
  try {
    const response = await fetch('../../api/overlay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        backgroundImage,
        overlayImage,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch');
    }

    const data = await response.json();
    console.log('Path to resulting image:', data.outputPath);
  } catch (error) {
    console.error('Error:', error);
  }
}




export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
