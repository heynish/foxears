import { NextRequest, NextResponse } from "next/server";
import satori from "satori";
import sharp from 'sharp';
import { join } from "path";
import * as fs from "fs";

export const dynamic = "force-dynamic";

const interRegPath = join(process.cwd(), "public/Inter-Regular.ttf");
let interReg = fs.readFileSync(interRegPath);

const interBoldPath = join(process.cwd(), "public/Inter-Bold.ttf");
let interBold = fs.readFileSync(interBoldPath);

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const name = searchParams.get('name') ?? "";
    const desc = searchParams.get('desc') ?? "";


    const svg = await satori(
        <div
            style={{
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
                backgroundImage: `url(/dapps/bg.png'))`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "bold",
                    fontSize: 48,
                }}
            >
                Linea Ecosystem Dapps
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "bold",
                    fontSize: 32,
                    marginTop: 12
                }}
            >
                {name}
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    fontSize: 16,
                    marginTop: 12
                }}
            >
                {desc}
            </div>
        </div>,
        {
            width: 800,
            height: 418,
            fonts: [
                {
                    name: "Inter",
                    data: interReg,
                    weight: 400,
                    style: "normal",
                },
                {
                    name: "Inter",
                    data: interBold,
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
    console.log('Image Created');
    return new NextResponse(img, {
        status: 200,
        headers: {
            "Content-Type": "image/png",
            "Cache-Control": "no-store",
        },
    });
}