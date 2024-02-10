"use client";
import { useEffect, useState } from "react";
import Leaderboard from "./Leaderboard";

interface Stats {
    username?: string;
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

    const { username, totalloads, leaderboard } = stats;

    return (
        <div className="space-y-4">
            <h1 className="text-8xl font-bold">Dapp Explorer</h1>
            {<p className="text-2xl">{username} is the top explorer.</p>}
            {<p className="text-2xl">The dapps have been explored {totalloads} times.</p>}
            <div className="mt-4 text-xl">
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
    );
}