export default function Leaderboard({
    leaderboard,
}: {
    leaderboard: [string, number][];
}) {
    return (
        <div className="container mx-auto mt-5 px-4 sm:px-6 lg:px-32">
            <p style={{ marginBottom: '10px', fontSize: '24px', fontWeight: '300', color: '#60DEFF' }}>Leaderboard</p>
            <div className="overflow-x-auto text-xl shadow-lg rounded">
                <table className="w-full text-center border-collapse border border-gray-200 bg-white"
                    style={{ backgroundColor: '#1D1D1D', borderColor: '#505050' }}>
                    <thead className="bg-indigo-100" style={{ backgroundColor: '#505050' }}>
                        <tr>
                            <th className="border border-gray-300 px-2 py-2 text-gray-700 sm:px-4 sm:py-2 sm:text-base font-sans"
                                style={{ color: 'white', borderColor: '#505050', fontSize: '16px', fontWeight: '300' }}>
                                Rank
                            </th>
                            <th className="border border-gray-300 px-2 py-2 text-gray-700 sm:px-4 sm:py-2 sm:text-base font-sans"
                                style={{ color: 'white', borderColor: '#505050', fontSize: '16px', fontWeight: '300' }}>
                                User
                            </th>
                            <th className="border border-gray-300 px-2 py-2 text-gray-700 sm:px-4 sm:py-2 sm:text-base font-sans"
                                style={{ color: 'white', borderColor: '#505050', fontSize: '16px', fontWeight: '300' }}>
                                Explores
                            </th>
                        </tr>
                    </thead>
                    <tbody className="font-sans text-gray-700" style={{ color: '#60DEFF', fontSize: '16px' }}>
                        {leaderboard.slice(0, 100).map(([user, loads], index) => (
                            <tr key={user}>
                                <td className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-2" style={{ borderColor: '#505050' }}>
                                    {index + 1}
                                </td>
                                <td className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-2" style={{ borderColor: '#505050' }}>
                                    <a className="hover:underline hover:text-red-500" href={`https://warpcast.com/${user.startsWith("FID #") ? '' : user}`}
                                        target="_blank" style={{ color: '#60DEFF' }}>
                                        {user}
                                    </a>
                                </td>
                                <td className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-2" style={{ borderColor: '#505050' }}>{loads}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}