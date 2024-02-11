import { NextRequest, NextResponse } from "next/server";
import satori from "satori";
import sharp from 'sharp';
import { join } from "path";
import * as fs from "fs";

export const dynamic = "force-dynamic";

const regPath = join(process.cwd(), "public/font/AtypDisplay-Regular.ttf");
let reg = fs.readFileSync(regPath);

const boldPath = join(process.cwd(), "public/font/AtypDisplay-Semibold.ttf");
let bold = fs.readFileSync(boldPath);

export async function GET(req: NextRequest) {
    console.time("Image Return");
    const searchParams = req.nextUrl.searchParams
    const url = searchParams.get('url') ?? "";
    const x = searchParams.get('x') ?? "";
    const y = searchParams.get('y') ?? "";
    const w = searchParams.get('width') ?? "";


    const overlayImage = `${process.env.HOST}/ears.png`; // replace with your overlay image URL

    const svg = await satori(
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
            backgroundImage: `url(${url})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
        }}>
            <img src={overlayImage} style={{ position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${w}px` }} />
        </div>,
        {
            width: 800,
            height: 418,
            fonts: [
                {
                    name: "Atyp",
                    data: reg,
                    weight: 400,
                    style: "normal",
                },
                {
                    name: "Atyp",
                    data: bold,
                    weight: 800,
                    style: "normal",
                },
            ],
        },
    );

    const img = await sharp(Buffer.from(svg))
        .resize(1200)
        .toFormat("png")
        .toBuffer();
    console.timeEnd("Image Return");
    return new NextResponse(img, {
        status: 200,
        headers: {
            "Content-Type": "image/png",
            "Cache-Control": "no-store",
        },
    });
}