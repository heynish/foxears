import {
  FrameRequest,
  getFrameMessage,
  getFrameHtmlResponse,
} from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { createBase } from '../../core/createBase';
import ImageDetails from '../../core/imageData';
import { addUser, incrementUserTotalLoads } from '../../core/addUser';

// Define the HUBBLE_URL endpoint
const HUBBLE_URL = "https://nemes.farcaster.xyz:2281/v1";

// Define a timeout function that returns a Promise
function timeout(ms: number): Promise<NextResponse> {
  return new Promise(resolve => setTimeout(() => {
    resolve(new NextResponse(getFrameHtmlResponse({
      buttons: [
        {
          label: '🔄 Refresh',
        },
      ],
      image: `https://mframes.vercel.app/1.png`,
      post_url: `https://mframes.vercel.app/api/masks`,
    })));
  }, ms));
}

// Async function to handle the GET response
async function getResponse(req: NextRequest): Promise<NextResponse> {
  console.time('Total Response Time');

  let accountAddress: string | undefined = '';
  let follow: boolean | undefined = false;
  let recast: boolean | undefined = false;
  let FID: number | undefined = 3;

  // Parse the JSON body from the request
  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey: process.env.NEYNAR_API_KEY
  });
  // Handle valid messages
  if (isValid) {
    FID = message.interactor.fid ?? 3;
    follow = message.following;
    recast = message.recasted;
    accountAddress = message.interactor.verified_accounts[0];
  }

  console.log("Message Valid", FID, follow, recast, accountAddress);
  try {
    console.time('Fetch User Data Time');

    const sdk = require('api')('@neynar/v2.0#66h3glq5brsni');

    let username: string | undefined = '';
    let pfp: string | undefined = '';
    await sdk.user({ fid: FID, viewerFid: FID, api_key: process.env.NEYNAR_API_KEY })
      // @ts-ignore
      .then(({ data }) => {
        username = data.result.user.username;
        pfp = data.result.user.pfp.url;
        console.log(username, pfp);
      })
      // @ts-ignore
      .catch(err => console.error(err));
    console.timeEnd('Fetch User Data Time');

    console.time('Overlay Image Processing Time');
    // Overlay images and get the details
    const urlbase = await createBase(`${pfp}.jpg`);
    console.timeEnd('Overlay Image Processing Time');
    console.log("Image Created");

    // Prepare user data for adding/updating user records
    const userData = {
      username,
      address: accountAddress || "",
      loads: 1,
      following: follow || false,
      recasted: recast || false,
      image: urlbase,
    };

    console.time('User Data Update Time');
    // Increment user total loads and add user if new
    let newUser = false;
    const totalLoads = await incrementUserTotalLoads(username);
    newUser = totalLoads ? false : await addUser(userData);
    console.timeEnd('User Data Update Time');
    console.log("Database updated");

    const x = 50;
    const y = 50;
    const w = 50;

    // Generate the post URL
    const postURL = `${process.env.HOST}/api/masks/choice?url=${urlbase}&x=${x}&y=${y}&width=${w}`;

    // Prepare and return the HTML response
    console.log("Sending response");
    console.timeEnd('Total Response Time');
    return new NextResponse(getFrameHtmlResponse({
      buttons: [
        { label: '↔️ Left/Right' },
        { label: '↕️ Up/Down' },
        { label: '🫧 Resize' },
      ],
      image: `${process.env.HOST}/api/masks/image?url=${urlbase}&x=${x}&y=${y}&width=${w}`,
      post_url: postURL,
    }));

  } catch (error) {
    // Log and return an error response if an exception occurs
    console.timeEnd('Total Response Time');
    console.error('An error occurred:', error);
    return new NextResponse('An error occurred', { status: 500 });
  }
}

// Export the POST function that routes to getResponse
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    return await Promise.race([
      getResponse(req),
      timeout(4990) // Set the timeout just under 5 seconds at 4.99 seconds
    ]);
  } catch (error) {
    console.error('An error occurred:', error);
    return new NextResponse('An error occurred', { status: 500 });
  }
}

// Force-dynamic export to ensure serverless function behavior
export const dynamic = 'force-dynamic';