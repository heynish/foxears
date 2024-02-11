import { NextRequest, NextResponse } from "next/server";
import satori from "satori";
import sharp from 'sharp';
import { join } from "path";
import * as fs from "fs";
import { supabase } from '../../../lib/supabase';

export const dynamic = "force-dynamic";

const regPath = join(process.cwd(), "public/dappsimage/AtypDisplay-Regular.ttf");
let reg = fs.readFileSync(regPath);

const boldPath = join(process.cwd(), "public/dappsimage/AtypDisplay-Semibold.ttf");
let bold = fs.readFileSync(boldPath);

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const username = searchParams.get('user') ?? "";

    const { data: rank, error } = await supabase.rpc('get_rank', { p_username: username })

    if (error) {
        console.error(error)
        return
    }

    console.log(rank);

    const { data: loads, error: error1 } = await supabase
        .from('dapps')
        .select('loads')
        .eq('username', username)

    if (error1) {
        console.error(error1)
        return
    }

    console.log(loads);

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
                backgroundImage: `url(https://mframes.vercel.app/dappsimage/bg.png)`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontFamily: 'Atyp',
                    fontSize: 60,
                }}
            >
                Your rank {" #"}{rank}
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    fontFamily: 'Atyp',
                    fontSize: 28,
                    marginTop: 12
                }}
            >
                Total explores {" "}{rank}
            </div>
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
    console.log('Image Created');
    return new NextResponse(img, {
        status: 200,
        headers: {
            "Content-Type": "image/png",
            "Cache-Control": "no-store",
        },
    });
}