"use client";
import { useEffect, useState } from "react";
import { supabase } from '../lib/supabase';
import Leaderboard from "./Leaderboard";


interface Stats {
    totalloads?: string;
    leaderboard?: [string, number][];
}

export default function Explorer() {
    const [stats, setStats] = useState<Stats>({});

    useEffect(() => {
        const getStats = async () => {
            const { data: totalLoadsData, error: error2 } = await supabase.rpc("count_loads");
            if (error2) throw error2;
            let totalLoads;
            if (totalLoadsData[0]) {
                console.log('totalLoadsData[0]', totalLoadsData[0]);
                totalLoads = totalLoadsData[0].get_sum_loads;
            } else {
                console.error('Error calling get_sum_loads:', error2);
                console.error('No data returned from get_sum_loads');
            }

            const { data: leaderboardData, error } = await supabase
                .from('dapps')
                .select('username, loads') // assuming 'username' and 'loads' are your actual column names
                .order('loads', { ascending: false })
                .limit(100);

            if (error) throw error;

            const leaderboard = leaderboardData.map(({ username, loads }) => [username, loads] as [string, number]);

            setStats({ totalloads, leaderboard });
        };

        getStats();
    }, []); // Empty dependency array ensures this runs on component mount

    const { totalloads, leaderboard } = stats;
    console.log(totalloads, leaderboard);

    return (
        <>
            <div className="space-y-4 text-center">
                <img src="/dappsimage/logolinea.svg" alt="Logo" className="mx-auto" />

                <h1 className="text-8xl" style={{ fontFamily: 'Atyp' }}>Dapp Explorer</h1>

                <p className="text-2xl" style={{ fontFamily: 'Atyp' }}>
                    The dapps have been explored {totalloads} times.
                </p>

                <div className="mt-4 text-xl" style={{ fontFamily: 'Atyp' }}>
                    <p>
                        Explore{" "}
                        <a
                            className="text-red-500 underline"
                            href="https://warpcast.com/"
                            target="_blank"
                        >
                            here
                        </a>{" "}
                        on Warpcast.
                    </p>
                </div>

                {leaderboard && <Leaderboard leaderboard={leaderboard ?? []} />}
            </div>

        </>
    );
}