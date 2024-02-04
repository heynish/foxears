import { USER_DATA_TYPE, UserData } from "../../../farcaster/user";
import { NextRequest, NextResponse } from 'next/server';

// Farcaster API
const HUBBLE_URL = "https://nemes.farcaster.xyz:2281/v1";

async function getResponse(req: NextRequest): Promise<NextResponse> {


  return NextResponse.redirect('https://mframes.vercel.app/pfp', { status: 302 });
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
