'use client';
import {useRouter} from "next/navigation";
import {useEffect} from "react";
import { useSearchParams } from 'next/navigation';

export default function RedirectPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    let page: string;

  // E.g. `/dashboard?page=2&order=asc`
    page = searchParams.get('pfp') ?? 'https://metamask.io/developer/';

    useEffect(() => {
        const metamaskurl = page;

        // Perform the redirect
        window.location.href = metamaskurl; // For a full page reload redirect
        // Or use Next.js router for client-side redirect (comment out the line above if using this)
        // router.push(youtubeUrl);
    }, [router]);

    return (
        <div>
            <p>Redirecting...</p>
        </div>
    );
}