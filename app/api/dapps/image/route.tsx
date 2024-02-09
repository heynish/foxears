import { NextRequest, NextResponse } from "next/server";
import satori from "satori";
import Jimp from 'jimp';
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


    const svg = await satori(
        <div
            style={{
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                backgroundColor: "white",
                padding: 50,
                lineHeight: 1.2,
                fontSize: 24,
                color: "black",
            }}
        >
            <h1>Linea Ecosystem Dapps</h1>
            <div style={{ display: "flex" }}>
                You have the flag{" "}
                <img
                    width="32"
                    height="32"
                    src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/15.0.3/72x72/1f6a9.png"
                />
            </div>
            <div style={{ display: "flex", marginTop: 12 }}>{name}</div>
        </div>,
        {
            width: 600,
            height: 400,
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

    let img = await Jimp.read(Buffer.from(svg));

    // resize image
    img = img.resize(1200, Jimp.AUTO);

    // convert to PNG and get buffer
    const buffer = await new Promise((resolve, reject) => {
        img.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
            if (err) reject(err);
            else resolve(buffer);
        });
    });

    /*const img = await sharp(Buffer.from(svg))
        .resize(1200)
        .toFormat("png")
        .toBuffer();*/
    // @ts-ignore
    return new NextResponse(buffer, {
        status: 200,
        headers: {
            "Content-Type": "image/png",
            "Cache-Control": "max-age=10",
        },
    });
}