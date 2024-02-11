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
    let username: string | undefined = '';

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


        console.time('Fetch User Data Time');

        const sdk = require('api')('@neynar/v2.0#66h3glq5brsni');

        let username: string | undefined = '';
        let pfp: string | undefined = '';
        await sdk.user({ fid: FID, viewerFid: FID, api_key: process.env.NEYNAR_API_KEY })
            // @ts-ignore
            .then(({ data }) => {
                username = data.result.user.username;
            })
            // @ts-ignore
            .catch(err => console.error(err));
        console.timeEnd('Fetch User Data Time');

        switch (buttonId) {
            case 1:
                // Prepare user data for adding/updating user records
                const userData = {
                    username,
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
                const imageUrl = `https://mframes.vercel.app/api/dapps/image?name=${randomRow.Name}&desc=${randomRow.Desc}`;
                const label = `Visit ${randomRow.Name}`;
                const urlR = `${randomRow.url}`;
                console.log('urlR', urlR);
                console.timeEnd('Total Response Time');
                return new NextResponse(getFrameHtmlResponse({
                    buttons: [
                        { label: 'Explore Another' },
                        { action: 'post_redirect', label: label },
                        { label: 'My Score' },
                        { action: 'post_redirect', label: 'Leaderboard' },
                    ],
                    image: imageUrl,
                    post_url: 'https://mframes.vercel.app/api/dapps?' + 'urlR=' + urlR,
                })
                );
                break;
            case 2:
                const searchParams = req.nextUrl.searchParams
                const url = searchParams.get('urlR') ?? "";
                console.log('urlR', url);
                console.timeEnd('Total Response Time');
                // @ts-ignore
                return NextResponse.redirect(url, { status: 302 });
                break;
            case 3:
                const rankUrl = `https://mframes.vercel.app/api/dapps/rank?user=${username}`;
                console.log('rankUrl', rankUrl);
                console.timeEnd('Total Response Time');
                return new NextResponse(getFrameHtmlResponse({
                    buttons: [
                        { label: 'Explore Another' },
                    ],
                    image: rankUrl,
                    post_url: 'https://mframes.vercel.app/api/dapps',
                })
                );
                break;
            case 4:
                console.timeEnd('Total Response Time');
                // @ts-ignore
                return NextResponse.redirect('https://mframes.vercel.app/dapps', { status: 302 });
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