import { NextRequest, NextResponse } from "next/server";
import satori from "satori";
import sharp from 'sharp';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const url = searchParams.get('url') ?? "";
    const x = searchParams.get('x') ?? "";
    const y = searchParams.get('y') ?? "";
    const w = searchParams.get('width') ?? "";


    const overlayImage = `${process.env.HOST}/ears.png`; // replace with your overlay image URL
    console.log('overlayImage, url', overlayImage, url);

    const svg = await satori(`
        <div style={{
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            backgroundColor: "black",
            padding: 50,
            lineHeight: 1.2,
            color: "white",
            backgroundImage: url(${url}),
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
        }}>
            <img src="${overlayImage}" style={{position: 'absolute', left: '${x}px', top: '${y}px', width: '${w}px'}} />
        </div>`,
        {
            width: 800,
            height: 418,
            fonts: [], // add this line
        },
    );

    const img = await sharp(Buffer.from(svg))
        .resize(1200)
        .toFormat("png")
        .toBuffer();
    console.log('Image Created');
    return new NextResponse(img, {
        status: 200,
        headers: {
            "Content-Type": "image/png",
            "Cache-Control": "no-store",
        },
    });
}