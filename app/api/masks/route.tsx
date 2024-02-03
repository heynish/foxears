import {
  FrameRequest,
  getFrameAccountAddress,
  getFrameMessage,
  getFrameHtmlResponse,
} from '@coinbase/onchainkit';
//import { getFrameAccountPFP } from '../../core/getFrameAccountPFP';
import { USER_DATA_TYPE, UserData } from "../../farcaster/user";
import { NextRequest, NextResponse } from 'next/server';
import { overlayImages } from '../../core/overlayImages';
import ImageDetails from '../../core/imageData';
import { addUser, incrementUserTotalLoads } from '../../core/addUser';

const imageUrl: string = 'http://example.com/image.jpg';
const imageName: string = 'my-image.jpg';

// Farcaster API
const HUBBLE_URL = "https://nemes.farcaster.xyz:2281/v1";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  let accountAddress: string | undefined = '';
  let outputimage: string | undefined = 'https://mframes.vercel.app/2.png';
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

    /*outputimage = await overlayImages('https://mframes.vercel.app/3.png', pfp+'.jpg', username+'.png', {
      x: 50, // Set overlay position X-coordinate to 50
      y: 50, // Set overlay position Y-coordinate to 50
    });*/

    const { urlfinal, urlbase, x, y }: ImageDetails =  await overlayImages('https://mframes.vercel.app/3.png', pfp+'.jpg', username+'.png', {
      x: 50, // Set overlay position X-coordinate to 50
      y: 50, // Set overlay position Y-coordinate to 50
    });

    //save to db
    const userData = {
      username: username,
      address: accountAddress || "",
      totalloads: 1,
      lastimage: urlbase,
    };
    
    // Add the user
    async function checkUserAndPerformAction(username: string) {
      try {
        const totalLoads = await incrementUserTotalLoads(username);
        if (totalLoads) {
          console.log(`User exists.`);
          // Perform actions based on the total loads
        } else {
          console.log('User does not exist.');
          // Handle the case where the user does not exist
          const newUser = await addUser(userData);
          console.log('New User Added:', newUser);
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
    checkUserAndPerformAction(userData.username);
    const postURL = 'https://mframes.vercel.app/api/masks/move?url='+urlbase+'&x='+x+'&y='+y;
    console.log(postURL);
  console.log('return response', postURL);
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
      image: urlfinal,
      post_url: postURL,
      refresh_period: 10,
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
