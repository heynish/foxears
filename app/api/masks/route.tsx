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

// Define the HUBBLE_URL endpoint
const HUBBLE_URLN = "https://846697.hubs.neynar.com:2281/v1";
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
  console.log("Message Valid");
  try {

    console.time('Fetch User Data Time');
    // Fetch user data using parallel API calls
    const [usernameData, pfpData] = await Promise.all([
      fetch(`${HUBBLE_URL}/userDataByFid?fid=${FID}&user_data_type=${USER_DATA_TYPE.USERNAME}`).then(res => res.json()),
      fetch(`${HUBBLE_URL}/userDataByFid?fid=${FID}&user_data_type=${USER_DATA_TYPE.PFP}`).then(res => res.json())
    ]);
    console.timeEnd('Fetch User Data Time');
    console.log("User Fetched");
    // Extract username and profile picture (pfp)
    const username = usernameData.data.userDataBody.value;
    const pfp = pfpData.data.userDataBody.value;

    // Set the overlay image options
    const overlayImageOptions = { x: 50, y: 50 };

    console.time('Overlay Image Processing Time');
    // Overlay images and get the details
    const { urlfinal, urlbase, x, y, w }: ImageDetails = await overlayImages(
      'https://mframes.vercel.app/3.png',
      `${pfp}.jpg`,
      `${username}.png`,
    );
    console.timeEnd('Overlay Image Processing Time');
    console.log("Image Created");
    // Prepare user data for adding/updating user records
    const userData = {
      username,
      address: accountAddress || "",
      loads: 1,
      following: follow,
      recasted: recast,
      image: urlbase,
    };

    console.time('User Data Update Time');
    // Increment user total loads and add user if new
    let newUser = false;
    const totalLoads = await incrementUserTotalLoads(username);
    newUser = totalLoads ? false : await addUser(userData);
    console.timeEnd('User Data Update Time');
    console.log("Database updated");
    // Generate the post URL
    const postURL = `https://mframes.vercel.app/api/masks/choice?urlfinal=${urlfinal}&url=${urlbase}&x=${x}&y=${y}&width=${w}`;

    // Prepare and return the HTML response
    console.log("Sending response");
    console.timeEnd('Total Response Time');
    return new NextResponse(getFrameHtmlResponse({
      buttons: [
        { label: '↔️ Left/Right' },
        { label: '↕️ Up/Down' },
        { label: '🫧 Resize' },
      ],
      image: urlfinal,
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

/*import {
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
    }));

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

export const dynamic = 'force-dynamic';*/



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