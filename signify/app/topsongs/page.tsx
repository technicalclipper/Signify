"use client";

import { useReadContract, useWriteContract,useAccount } from "wagmi";
import { contractaddress, abi } from "../../lib/SongContract";
import { useEffect, useState } from "react";

const IPFS_GATEWAY = "https://tan-adjacent-mammal-701.mypinata.cloud/ipfs/";

interface SongMetadata {
  songName: string;
  artist: string;
  description: string;
  songCid: string;
  coverCid: string;
  artistaddress: string;
  votes: number;
  totalFunding: number;
}

export default function TopSongsPage() {
  const { data, isLoading, error } = useReadContract({
    abi,
    address: contractaddress,
    functionName: "getSongs",
  });

  const { writeContractAsync } = useWriteContract();

  const [songs, setSongs] = useState<SongMetadata[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null);
  const [fundingAmount, setFundingAmount] = useState<string>("");
  const [dealDetails, setDealDetails] = useState({ ownership: "", revenueSplit: "", upfrontPayment: "" });
  const { address, isConnected } = useAccount();

  useEffect(() => {
    async function fetchMetadata() {
      if (data) {
        const [ids, ipfsHashes, artists, votes, funds] = data;

        const fetchedSongs = await Promise.all(
          ipfsHashes.map(async (hash: string, index: number) => {
            try {
              const response = await fetch(`${IPFS_GATEWAY}${hash}`);
              const metadata = await response.json();

              return {
                ...metadata,
                artistaddress: artists[index],
                votes: Number(votes[index]),
                totalFunding: Number(funds[index]) / 1e18,
              };
            } catch (err) {
              console.error("Error fetching metadata:", err);
              return null;
            }
          })
        );

        setSongs(fetchedSongs.filter(Boolean));
      }
    }
    fetchMetadata();
  }, [data]);

  const openModal = (songId: number) => {
    setSelectedSongId(songId + 1);
    setIsModalOpen(true);
  };

  const openDealModal = (songId: number) => {
    setSelectedSongId(songId + 1);
    setIsDealModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFundingAmount("");
  };

  const closeDealModal = () => {
    setIsDealModalOpen(false);
    setDealDetails({ ownership: "", revenueSplit: "", upfrontPayment: "" });
  };

  const handleVote = async () => {
    if (!fundingAmount || Number(fundingAmount) <= 0 || selectedSongId === null) {
      alert("Please enter a valid amount to fund!");
      return;
    }

    try {
      await writeContractAsync({
        abi,
        address: contractaddress,
        functionName: "voteSong",
        args: [selectedSongId],
        value: BigInt(Number(fundingAmount) * 1e18),
      });
      alert("Vote successful!");
      closeModal();
    } catch (error) {
      console.error("Error voting:", error);
      alert("Voting failed!");
    }
  };

  const handleProposeDeal = async () => {
    if (!dealDetails.ownership || !dealDetails.revenueSplit || !dealDetails.upfrontPayment || selectedSongId === null) {
      alert("Please enter all deal details!");
      return;
    }
  
    try {
      await writeContractAsync({
        abi,
        address: contractaddress,
        functionName: "proposeDeal",
        args: [
          selectedSongId,
          address,
          dealDetails.ownership,
          dealDetails.revenueSplit,
        ],
        value: BigInt(Math.round(parseFloat(dealDetails.upfrontPayment) * 1e18)), // ✅ Corrected conversion
      });
  
      alert("Deal proposed successfully!");
      closeDealModal();
    } catch (error) {
      console.error("Error proposing deal:", error);
      alert("Deal proposal failed!");
    }
  };
  
  
  return (
    <main className="w-full min-h-screen flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Top Songs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.length > 0 ? (
          songs.map((song, index) => (
            <div key={index} className="p-4 border border-gray-300 rounded-lg shadow-md w-80">
              <img src={`${IPFS_GATEWAY}${song.coverCid}`} alt={song.songName} className="w-full h-40 object-cover rounded-md" />
              <h2 className="text-lg font-semibold mt-2">{song.songName}</h2>
              <p className="text-gray-600">By {song.artist}</p>
              <p className="text-gray-500">{song.description}</p>

              <div className="text-sm text-gray-700 mt-2">
                <p><strong>Votes:</strong> {song.votes}</p>
                <p><strong>Total Funding:</strong> {song.totalFunding} ETH</p>
              </div>

              <div className="flex items-center justify-between bg-gray-800 text-white rounded-lg shadow-lg p-3">
                <audio controls className="w-full">
                  <source src={`${IPFS_GATEWAY}${song.songCid}`} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>

              <button onClick={() => openModal(index)} className="bg-blue-600 text-white px-4 py-2 mt-3 rounded-md hover:bg-blue-700 w-full">Fund & Vote</button>
              <button onClick={() => openDealModal(index)} className="bg-green-600 text-white px-4 py-2 mt-2 rounded-md hover:bg-green-700 w-full">Propose Deal</button>
            </div>
          ))
        ) : (
          <p>No songs found.</p>
        )}
      </div>

      {/* Fund & Vote Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md w-96">
            <h2 className="text-lg font-semibold">Fund & Vote</h2>
            <input type="number" value={fundingAmount} onChange={(e) => setFundingAmount(e.target.value)} className="border p-2 w-full mt-2" placeholder="Enter ETH amount" />
            <button onClick={handleVote} className="bg-blue-600 text-white px-4 py-2 mt-3 rounded-md hover:bg-blue-700 w-full">Submit</button>
            <button onClick={closeModal} className="text-red-600 mt-2">Close</button>
          </div>
        </div>
      )}

      {/* Propose Deal Modal */}
      {isDealModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md w-96">
            <h2 className="text-lg font-semibold">Propose Deal</h2>
            <input type="text" placeholder="Ownership %" value={dealDetails.ownership} onChange={(e) => setDealDetails({ ...dealDetails, ownership: e.target.value })} className="border p-2 w-full mt-2" />
            <input type="text" placeholder="Revenue Split %" value={dealDetails.revenueSplit} onChange={(e) => setDealDetails({ ...dealDetails, revenueSplit: e.target.value })} className="border p-2 w-full mt-2" />
            <input type="number" placeholder="Upfront Payment (ETH)" value={dealDetails.upfrontPayment} onChange={(e) => setDealDetails({ ...dealDetails, upfrontPayment: e.target.value })} className="border p-2 w-full mt-2" />
            <button onClick={handleProposeDeal} className="bg-green-600 text-white px-4 py-2 mt-3 rounded-md hover:bg-green-700 w-full">Submit</button>
            <button onClick={closeDealModal} className="text-red-600 mt-2">Close</button>
          </div>
        </div>
      )}
    </main>
  );
}
