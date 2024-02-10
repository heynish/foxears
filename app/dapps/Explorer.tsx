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
            const totalloads = totalLoadsData;

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
    }, [stats]); // Empty dependency array ensures this runs on component mount

    const { totalloads, leaderboard } = stats;
    console.log(totalloads, leaderboard);

    return (
        <>
            <div className="space-y-4 text-center">
                <img src="/dappsimage/logolinea.svg" alt="Logo" className="mx-auto mb-60" style={{ width: '200px', height: '200px' }} />

                <h1 className="text-8xl" style={{ fontFamily: 'Atyp' }}>Dapp Explorer</h1>

                <p className="text-2xl mb-30" style={{ fontFamily: 'Atyp' }}>
                    Explored {totalloads} times.
                </p>

                <div className="mt-4 text-xl mb-30" style={{ fontFamily: 'Atyp' }}>
                    <p>
                        Explore dapps on{" "}
                        <a
                            className="text-red-500 underline"
                            href="https://warpcast.com/"
                            target="_blank"
                        >
                            Warpcast.
                        </a>
                    </p>
                </div>

                {leaderboard && <Leaderboard leaderboard={leaderboard ?? []} />}
            </div>

        </>
    );
}