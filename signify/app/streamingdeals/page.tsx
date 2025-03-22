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
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Accepted Deals</h2>
            <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border">Deal ID</th>
                        <th className="p-2 border">Song ID</th>
                        <th className="p-2 border">Record Label</th>
                        <th className="p-2 border">Ownership %</th>
                        <th className="p-2 border">Revenue Split %</th>
                        <th className="p-2 border">Upfront Payment (ETH)</th>
                        <th className="p-2 border">Enter ETH</th>
                        <th className="p-2 border">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {deals.map((deal, index) => (
                        <tr key={index} className="border-t">
                            <td className="p-2 border">{deal.dealId.toString()}</td>
                            <td className="p-2 border">{deal.songId.toString()}</td>
                            <td className="p-2 border">{deal.recordLabel}</td>
                            <td className="p-2 border">{deal.ownership.toString()}%</td>
                            <td className="p-2 border">{deal.revenueSplit.toString()}%</td>
                            <td className="p-2 border">{formatEther(deal.upfrontPayment)} ETH</td>
                            <td className="p-2 border">
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={ethAmounts[deal.dealId] || ""}
                                    onChange={(e) => setEthAmounts({
                                        ...ethAmounts,
                                        [deal.dealId]: e.target.value,
                                    })}
                                    className="border rounded p-1 w-24"
                                    placeholder="ETH"
                                />
                            </td>
                            <td className="p-2 border">
                                <button
                                    onClick={() => handlePayForLicense(deal.dealId)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Pay for License
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

