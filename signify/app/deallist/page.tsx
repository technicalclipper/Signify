"use client";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatEther } from "viem";
import { contractaddress, abi } from "../../lib/SongContract";
import { useState } from "react";
import axios from "axios";

export default function DealsList() {
    const { address } = useAccount(); // Get connected wallet address

    // Fetch deals for the artist
    const { data: deals, isLoading, error } = useReadContract({
        address: contractaddress,
        abi: abi,
        functionName: "getDealsForArtist",
        args: [address], // Pass connected wallet address as artist
    });

    // Accept deal function
    const { writeContract, isPending } = useWriteContract();

    const acceptDeal = async (dealId, deal) => {
        try {
            if (!address) {
                alert("Wallet not connected.");
                return;
            }
    
            const metadata = {
                name: `Music Deal #${dealId}`,
                description: `Deal between ${deal.recordLabel} and artist. ownership:${deal.ownership} revenueSplit:${deal.revenueSplit} upfrontPayment:${deal.upfrontPayment}`,    
                attributes: {
                    dealId: deal.dealId.toString(),
                    songId: deal.songId.toString(),
                    recordLabel: deal.recordLabel,
                    ownership: deal.ownership.toString(),
                    revenueSplit: deal.revenueSplit.toString(),
                    upfrontPayment: formatEther(deal.upfrontPayment) + " ETH",
                    acceptedBy: address,
                },
            };
    
            // Step 1: Call Next.js API to upload metadata
            const uploadResponse = await fetch("/api/uploadmetadata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(metadata),
            });
    
            const { url: tokenURI } = await uploadResponse.json();
            if (!tokenURI) throw new Error("Failed to upload metadata to IPFS.");
    
            // Step 2: Call smart contract function
            await writeContract({
                address: contractaddress,
                abi: abi,
                functionName: "acceptDeal",
                args: [dealId, tokenURI],
            });
    
            alert("Deal accepted! Metadata stored on IPFS.");
        } catch (err) {
            alert(`Error accepting deal: ${err.message}`);
        }
    };
    
    

    if (isLoading) return <p>Loading deals...</p>;
    if (error) return <p>Error fetching deals: {error.message}</p>;
    if (!deals || deals.length === 0) return <p>No deals found.</p>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Deals for Your Songs</h2>
            <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border">Deal ID</th>
                        <th className="p-2 border">Song ID</th>
                        <th className="p-2 border">Record Label</th>
                        <th className="p-2 border">Ownership %</th>
                        <th className="p-2 border">Revenue Split %</th>
                        <th className="p-2 border">Upfront Payment (ETH)</th>
                        <th className="p-2 border">Accepted</th>
                        <th className="p-2 border">Actions</th>
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
                            <td className="p-2 border">{deal.accepted ? "✅ Yes" : "❌ No"}</td>
                            <td className="p-2 border">
                                {!deal.accepted ? (
                                    <button
                                        onClick={() => acceptDeal(deal.dealId, deal)}
                                        className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                                        disabled={isPending}
                                    >
                                        {isPending ? "Processing..." : "Accept Deal"}
                                    </button>
                                ) : (
                                    "✅ Accepted"
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

