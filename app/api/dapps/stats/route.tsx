import { NextResponse } from "next/server";
import { supabase } from '../../../lib/supabase';

export const revalidate = 1800;

export async function GET() {
    const { data: topUserData, error: error1 } = await supabase
        .from('dapps')
        .select('username') // select the username column
        .order('loads', { ascending: false }) // order by 'loads' in descending order
        .limit(1) // limit to the first record

    if (error1) throw error1;
    const topUser = topUserData[0].username; // get the username of the user with the highest loads

    const { data: totalLoadsData, error: error2 } = await supabase
        .from('dapps')
        .select('sum(loads)') // sum all 'loads' and alias it as 'total'

    if (error2) throw error2;

    const totalLoads = totalLoadsData[0].sum; // get the username of the user with the highest loads


    const { data: leaderboardData, error } = await supabase
        .from('leaderboard')
        .select('username, loads') // assuming 'username' and 'loads' are your actual column names
        .order('loads', { ascending: false })
        .limit(100);

    if (error) throw error;

    const leaderboard = leaderboardData.map(({ username, loads }) => [username, loads]);

    return NextResponse.json({ topUser, totalLoads, leaderboard });
}