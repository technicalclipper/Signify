"use client";
import { useState } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import { formatEther, parseEther } from "viem";
import { contractaddress, abi } from "../../lib/SongContract";

export default function StreamingDeals() {
    // Fetch accepted deals
    const { data: deals, isLoading, error } = useReadContract({
        address: contractaddress,
        abi: abi,
        functionName: "getAcceptedDeals",
    });

    // State to store the ETH amount input by the user
    const [ethAmounts, setEthAmounts] = useState({});

    // Write function to pay for a license
    const { writeContract } = useWriteContract();

    const handlePayForLicense = (dealId) => {
        if (!ethAmounts[dealId] || Number(ethAmounts[dealId]) <= 0) {
            alert("Please enter a valid ETH amount.");
            return;
        }

        writeContract({
            address: contractaddress,
            abi: abi,
            functionName: "payForLicense",
            args: [dealId],
            value: parseEther(ethAmounts[dealId]), // Convert entered ETH to Wei
        });
    };

    if (isLoading) return <p>Loading deals...</p>;
    if (error) return <p>Error fetching deals: {error.message}</p>;
    if (!deals || deals.length === 0) return <p>No accepted deals available.</p>;

    return (
        <main className="w-screen h-screen p-8 flex justify-start">
            {/* Full-Screen Retro Container */}
            <div className="w-full h-full bg-[#fff8e1] border-[5px] border-black shadow-[7px_7px_0px_#000] rounded-lg p-6">
                <h2 className="text-4xl font-bold text-left mb-6 font-mono text-[#2d1e2f] flex items-center gap-3">
                    💰Artists Accepted Deals
                </h2>
                <p className="text-xl px-3 mb-2">Deals you have accepted show up here!</p>

                {/* Styled Table */}
                <table className="w-full border-collapse border border-black rounded-lg text-sm">
                    <thead className="bg-[#2d1e2f] text-white text-base font-normal">
                        <tr className="text-left">
                            <th className="px-4 py-3 border border-black w-16">Deal ID</th>
                            <th className="px-4 py-3 border border-black w-20">Song ID</th>
                            <th className="px-4 py-3 border border-black w-64">Record Label</th>
                            <th className="px-4 py-3 border border-black w-24">Ownership %</th>
                            <th className="px-4 py-3 border border-black w-28">Revenue Split %</th>
                            <th className="px-4 py-3 border border-black w-40">Upfront Payment (ETH)</th>
                            <th className="px-4 py-3 border border-black w-28">Enter ETH</th>
                            <th className="px-4 py-3 border border-black w-36">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deals.map((deal, index) => (
                            <tr key={index} className="border-t text-left">
                                <td className="px-4 py-3 border border-black">{deal.dealId.toString()}</td>
                                <td className="px-4 py-3 border border-black">{deal.songId.toString()}</td>
                                <td className="px-4 py-3 border border-black truncate">{deal.recordLabel}</td>
                                <td className="px-4 py-3 border border-black">{deal.ownership.toString()}%</td>
                                <td className="px-4 py-3 border border-black">{deal.revenueSplit.toString()}%</td>
                                <td className="px-4 py-3 border border-black">{formatEther(deal.upfrontPayment)} ETH</td>
                                <td className="px-4 py-3 border border-black">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={ethAmounts[deal.dealId] || ""}
                                        onChange={(e) =>
                                            setEthAmounts({
                                                ...ethAmounts,
                                                [deal.dealId]: e.target.value,
                                            })
                                        }
                                        className="border border-black rounded p-2 w-24 bg-[#fff8e1] text-black shadow-inner"
                                        placeholder="ETH"
                                    />
                                </td>
                                <td className="px-4 py-3 border border-black">
                                    <button
                                        onClick={() => handlePayForLicense(deal.dealId)}
                                        className="bg-[#ffeb99] text-black px-4 py-2 rounded shadow-md hover:bg-black hover:text-white transition duration-200"

                                    >
                                        Pay for License
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}

