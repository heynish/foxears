  import {
    FrameRequest,
    getFrameAccountAddress,
    getFrameMessage,
    getFrameHtmlResponse,
  } from '@coinbase/onchainkit';
  //import { getFrameAccountPFP } from '../../core/getFrameAccountPFP';
  import { USER_DATA_TYPE, UserData } from "../../../farcaster/user";
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
  
      return NextResponse.redirect(pfp, {status: 302});
  }
  
  export async function POST(req: NextRequest): Promise<Response> {
    return getResponse(req);
  }
  
  export const dynamic = 'force-dynamic';
  