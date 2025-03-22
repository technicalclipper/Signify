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
        <main className="w-screen h-screen  p-8 flex justify-start">
            {/* Full-Screen Container */}
            <div className="w-full h-full bg-[#fff8e1] border-[5px] border-black shadow-[7px_7px_0px_#000] rounded-lg p-6">
                <h2 className="text-4xl font-bold text-left mb-6 font-mono text-[#2d1e2f] flex items-center gap-3">
                    📜 Deals for Your Songs
                </h2>
                <p className="text-xl px-3 mb-2">Deals Proposed to you show up here!</p>

                {/* Table with Adjusted Widths */}
                <table className="w-full border-collapse border border-black rounded-lg text-sm">
                    <thead className="bg-[#2d1e2f] text-white text-base font-normal">
                        <tr className="text-left">
                            <th className="px-4 py-3 border border-black w-16">Deal ID</th>
                            <th className="px-4 py-3 border border-black w-20">Song ID</th>
                            <th className="px-4 py-3 border border-black w-64">Record Label</th>
                            <th className="px-4 py-3 border border-black w-24">Ownership %</th>
                            <th className="px-4 py-3 border border-black w-28">Revenue Split %</th>
                            <th className="px-4 py-3 border border-black w-40">Upfront Payment (ETH)</th>
                            <th className="px-4 py-3 border border-black w-20">Accepted</th>
                            <th className="px-4 py-3 border border-black w-28">Actions</th>
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
                                    {deal.accepted ? "✅ Yes" : "❌ No"}
                                </td>
                                <td className="px-4 py-3 border border-black">
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
        </main>
    );
}

