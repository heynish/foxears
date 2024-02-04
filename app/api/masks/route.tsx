import {
  FrameRequest,
  getFrameMessage,
  getFrameHtmlResponse,
} from '@coinbase/onchainkit';
import { USER_DATA_TYPE, UserData } from "../../farcaster/user";
import { NextRequest, NextResponse } from 'next/server';
import { overlayImages } from '../../core/overlayImages';
import ImageDetails from '../../core/imageData';
import { addUser, incrementUserTotalLoads } from '../../core/addUser';

// Farcaster API endpoint
const HUBBLE_URL = "https://846697.hubs.neynar.com:2281/v1";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  let accountAddress: string | undefined = '';
  let follow: boolean | undefined = false;
  let FID: number | undefined = 3;

  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey: process.env.NEYNAR_API_KEY
  });

  if (isValid) {
    FID = message.interactor.fid ?? 3;
    follow = message.following;
    accountAddress = message.interactor.verified_accounts[0];
  }

  try {
    const [usernameData, pfpData] = await Promise.all([
      fetch(`${HUBBLE_URL}/userDataByFid?fid=${FID}&user_data_type=${USER_DATA_TYPE.USERNAME}`).then(res => res.json()),
      fetch(`${HUBBLE_URL}/userDataByFid?fid=${FID}&user_data_type=${USER_DATA_TYPE.PFP}`).then(res => res.json())
    ]);

    const username = usernameData.data.userDataBody.value;
    const pfp = pfpData.data.userDataBody.value;

    const overlayImageOptions = { x: 50, y: 50 }; // Overlay positions
    const { urlfinal, urlbase, x, y }: ImageDetails = await overlayImages('https://mframes.vercel.app/3.png', `${pfp}.jpg`, `${username}.png`, overlayImageOptions);

    const userData = {
      username,
      address: accountAddress || "",
      totalloads: 1,
      following: follow,
      image: urlbase,
    };

    let newUser = false;
    const totalLoads = await incrementUserTotalLoads(username);
    newUser = totalLoads ? false : await addUser(userData);
    /*
        const postURL = `https://mframes.vercel.app/api/masks/move?url=${urlbase}&x=${x}&y=${y}`;
    
        return new NextResponse(getFrameHtmlResponse({
          buttons: [
            { label: `◀️ Left` },
            { label: `Right ▶️` },
            { label: '⬆ Up' },
            { label: '⬇ Down' }
          ],
          image: urlfinal,
          post_url: postURL,
          refresh_period: 30,
        }));*/

    return new NextResponse(getFrameHtmlResponse({
      buttons: [
        { label: `◀️ Left` },
        { label: `Right ▶️` },
        { label: '⬆ Up' },
        { label: '⬇ Down' }
      ],
      image: urlfinal,
      post_url: 'https://mframes.vercel.app/api/masks/move',
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
import { USER_DATA_TYPE, UserData } from "../../farcaster/user";
import { NextRequest, NextResponse } from 'next/server';
import { overlayImages } from '../../core/overlayImages';
import ImageDetails from '../../core/imageData';
import { addUser, incrementUserTotalLoads } from '../../core/addUser';

// Farcaster API
//const HUBBLE_URL = "https://nemes.farcaster.xyz:2281/v1";
const HUBBLE_URL = "https://846697.hubs.neynar.com:2281/v1";


async function getResponse(req: NextRequest): Promise<NextResponse> {
  let accountAddress: string | undefined = '';
  let follow: boolean | undefined = false;
  let FID: number | undefined = 3;

  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey: process.env.NEYNAR_API_KEY
  });
  if (isValid) {
    try {
      // Get the Farcaster ID from the message
      FID = message.interactor.fid ?? 3;
      follow = message.following;
      accountAddress = message.interactor.verified_accounts[0];
      //console.log("verifiedAddress", message.interactor.verified_accounts);
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

  console.log("1.1 Calling overlay", 'https://mframes.vercel.app/3.png', pfp + '.jpg', username + '.png');
  const { urlfinal, urlbase, x, y }: ImageDetails = await overlayImages('https://mframes.vercel.app/3.png', pfp + '.jpg', username + '.png', {
    x: 50, // Set overlay position X-coordinate to 50
    y: 50, // Set overlay position Y-coordinate to 50
  });

  //save to db
  const userData = {
    username: username,
    address: accountAddress || "",
    totalloads: 1,
    following: follow,
    image: urlbase,
  };

  // Add the user to db
  try {
    const totalLoads = await incrementUserTotalLoads(username);
    if (totalLoads) {
      console.log(`1.2 User exists.`, username);
      // Perform actions based on the total loads
    } else {
      // Handle the case where the user does not exist
      const newUser = await addUser(userData);
      console.log('1.2 New User Added:', newUser);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }

  const postURL = 'https://mframes.vercel.app/api/masks/move?url=' + urlbase + '&x=' + x + '&y=' + y;
  console.log('1.3 return response', urlfinal, postURL);
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
      refresh_period: 30,
    }),
  );
}


export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
*/