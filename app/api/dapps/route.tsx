import {
    FrameRequest,
    getFrameMessage,
    getFrameHtmlResponse,
} from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { createImage } from '../../core/createImage';
import { addDappUser, incrementUserTotalLoads } from '../../core/addDappUser';
import csv from 'csv-parser';
import path from 'path';
import fs from 'fs';

interface CsvRow {
    Name: string;
    Desc: string;
    Category: string;
    url: string;
}

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
            post_url: `https://mframes.vercel.app/api/dapps`,
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

    console.log("Message Valid", buttonId);
    try {
        // Prepare user data for adding/updating user records
        const userData = {
            fid: FID,
            address: accountAddress || "",
            loads: 1,
            following: follow || false,
            recasted: recast || false,
        };
        // Increment user total loads and add user if new
        let newUser = false;
        const totalLoads = await incrementUserTotalLoads(FID);
        newUser = totalLoads ? false : await addDappUser(userData);
        console.log("Database updated");

        const processData = (): Promise<CsvRow[]> => {
            return new Promise((resolve, reject) => {
                const data: CsvRow[] = [];
                fs.createReadStream(path.resolve('public/dapps.csv'))
                    .on('error', (err: any) => {
                        console.error(err);
                        reject(err);
                    })
                    .pipe(csv())
                    .on('data', (row: CsvRow) => {
                        data.push(row);
                    })
                    .on('end', () => {
                        console.log('CSV file successfully processed');
                        resolve(data);
                    });
            });
        };

        // Use the function
        const fetchData = async (): Promise<CsvRow> => {
            try {
                const data = await processData();

                const randomIndex = Math.floor(Math.random() * data.length);
                console.log('randomIndex', randomIndex);
                const randomRow = data[randomIndex];
                const { Name: name, Desc: desc, Category: category, url } = randomRow;
                console.log(name, desc, category, url);

                return randomRow;
            } catch (err) {
                console.error('Error processing data:', err);
                throw err;  // Ensure error is propagated if you want to handle it outside
            }
        }

        const randomRow = await fetchData();

        //console.time('Overlay Image Processing Time');
        // Overlay images and get the details
        // @ts-ignore
        //const image = await createImage(name, desc, category);
        //console.timeEnd('Overlay Image Processing Time');
        const imageUrl = `https://mframes.vercel.app/api/dapps/image?name=${randomRow.Name}`;
        console.log('imageUrl', imageUrl);
        const label = `Visit ${randomRow.Name}`;
        const urlR = `${randomRow.url}`;
        console.log('urlR', urlR);

        switch (buttonId) {
            case 1:
                console.timeEnd('Total Response Time');
                return new NextResponse(getFrameHtmlResponse({
                    buttons: [
                        { label: 'Find Another' },
                        { action: 'post_redirect', label: label },
                    ],
                    image: imageUrl,
                    post_url: 'https://mframes.vercel.app/api/dapps',
                })
                );
                break;
            case 2:
                console.timeEnd('Total Response Time');
                // @ts-ignore
                return NextResponse.redirect(urlR, { status: 302 });
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