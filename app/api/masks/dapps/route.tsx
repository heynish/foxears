import {
    FrameRequest,
    getFrameMessage,
    getFrameHtmlResponse,
} from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { createImage } from '../../../core/createImage';
import { addDappUser, incrementUserTotalLoads } from '../../../core/addDappUser';

// Define a timeout function that returns a Promise
function timeout(ms: number): Promise<NextResponse> {
    return new Promise(resolve => setTimeout(() => {
        resolve(new NextResponse(getFrameHtmlResponse({
            buttons: [
                {
                    label: '🔄 Refresh',
                },
            ],
            image: `https://mframes.vercel.app/linea.png`,
            post_url: `https://mframes.vercel.app/api/masks/dapps`,
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
    let buttonId: number | undefined;

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
        buttonId = message.button || 1;
    }

    console.log("Message Valid", FID, follow, recast, accountAddress);
    try {
        // Prepare user data for adding/updating user records
        const userData = {
            fid: FID,
            address: accountAddress || "",
            loads: 1,
            following: follow || false,
            recasted: recast || false,
        };
        console.time('User Data Update Time');
        // Increment user total loads and add user if new
        let newUser = false;
        const totalLoads = await incrementUserTotalLoads(FID);
        newUser = totalLoads ? false : await addDappUser(userData);
        console.timeEnd('User Data Update Time');
        console.log("Database updated");

        const fs = require('fs');
        const csv = require('csv-parser');

        // @ts-ignore
        const data = [];

        fs.createReadStream('public/dapps.csv')
            .pipe(csv())
            // @ts-ignore
            .on('data', (row) => {
                data.push(row);
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
            });

        const randomIndex = Math.floor(Math.random() * data.length);
        // @ts-ignore
        const randomRow = data[randomIndex];

        const values = Object.values(randomRow);

        const name = values[0];
        const desc = values[1];
        const category = values[2];
        const url = values[3];

        console.log(name, desc, category, url);

        console.time('Overlay Image Processing Time');
        // Overlay images and get the details
        // @ts-ignore
        const image = await createImage(name, desc, category);
        console.timeEnd('Overlay Image Processing Time');

        switch (buttonId) {
            case 1:
                console.timeEnd('Total Response Time');
                return new NextResponse(getFrameHtmlResponse({
                    buttons: [
                        { label: 'Find Another' },
                        { action: 'post_redirect', label: 'Visit dapp' },
                    ],
                    image: image.toString(),
                    post_url: 'https://mframes.vercel.app/api/masks/dapps',
                }));
                break;
            case 2:
                console.timeEnd('Total Response Time');
                // @ts-ignore
                return NextResponse.redirect(url, { status: 302 });
                break;
            default:
                throw new Error('Invalid button ID.');
        }

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