"use client";
import { useEffect, useState } from "react";
import Leaderboard from "./Leaderboard";


interface Stats {
    topuser?: string;
    totalloads?: string;
    leaderboard?: [string, number][];
}

interface Flag {
    username?: string;
}

export default function Explorer() {
    const [stats, setStats] = useState<Stats>({});

    useEffect(() => {
        const getStats = async () => {
            let res = await fetch("/api/dapps/stats", { next: { revalidate: 10 } });
            const _stats = await res.json();
            setStats(_stats);
        };
        getStats();
    }, []);

    const { topuser, totalloads, leaderboard } = stats;
    console.log(topuser, totalloads, leaderboard);

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