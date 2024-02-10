"use client";
import { useEffect, useState } from "react";
import { supabase } from '../lib/supabase';
import Leaderboard from "./Leaderboard";


interface Stats {
    countall?: number | null | undefined;
    totalloads?: string;
    leaderboard?: [string, number][];
}

export default function Explorer() {
    const [stats, setStats] = useState<Stats>({});

    useEffect(() => {
        const getStats = async () => {

            let { data, error: error3, count } = await supabase
                .from('dapps')
                .select('*', { count: 'exact' })
            if (error3) throw error3;
            const countall = count;

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

            setStats({ countall, totalloads, leaderboard });
        };

        getStats();
    }, [stats]); // Empty dependency array ensures this runs on component mount

    const { countall, totalloads, leaderboard } = stats;
    console.log(totalloads, leaderboard);

    return (
        <>
            <div className="space-y-4 text-center">
                <img src="/dappsimage/logolinea.svg" alt="Logo" className="mx-auto" style={{ width: '120px', marginBottom: '60px' }} />

                <p style={{ marginBottom: '15px', fontSize: '60px', fontWeight: '300' }}>
                    Dapp Explorer
                </p>

                <p style={{ marginBottom: '30px', fontSize: '24px', fontWeight: '300' }}>
                    Explored <span style={{ fontWeight: '300', color: '#60DEFF' }}>{totalloads}</span> times by <span style={{ fontWeight: '300', color: '#60DEFF' }}>{countall}</span> Explorers.
                </p>

                <div style={{ marginBottom: '60px', fontSize: '12px' }}>
                    <button style={{
                        border: '1px solid #60DEFF',
                        borderRadius: '50px',
                        backgroundColor: 'transparent',
                        color: '#60DEFF',
                        padding: '8px 24px',
                        fontSize: '16px',
                        textTransform: 'uppercase',
                        cursor: 'pointer'
                    }} onClick={() => window.open('https://warpcast.com/', '_blank')}>
                        Explore Dapps  &rarr;
                    </button>
                </div>

                {leaderboard && <Leaderboard leaderboard={leaderboard ?? []} />}
            </div>

        </>
    );
}