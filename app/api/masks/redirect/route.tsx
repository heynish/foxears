import { NextRequest, NextResponse } from 'next/server';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  return NextResponse.redirect('https://mframes.vercel.app/pfp', { status: 302 });
}

export async function POST(req: NextRequest): Promise<Response> {
  // Extract query parameters from the request URL
  const { searchParams } = req.nextUrl;
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
