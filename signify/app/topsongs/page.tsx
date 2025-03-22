"use client";

import { useReadContract, useWriteContract } from "wagmi";
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
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null);
  const [fundingAmount, setFundingAmount] = useState<string>("");

  useEffect(() => {
    async function fetchMetadata() {
      if (data) {
        const [ids, ipfsHashes, artists, votes, funds] = data; // Extract arrays from contract response

        const fetchedSongs = await Promise.all(
          ipfsHashes.map(async (hash: string, index: number) => {
            try {
              const response = await fetch(`${IPFS_GATEWAY}${hash}`);
              const metadata = await response.json();

              return {
                ...metadata,
                artistaddress: artists[index], // Artist wallet address
                votes: Number(votes[index]), // Extract votes count
                totalFunding: Number(funds[index]) / 1e18, // Convert wei to ETH
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
    setSelectedSongId(songId+1);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFundingAmount("");
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
        value: BigInt(Number(fundingAmount) * 1e18), // Convert ETH to wei
      });
      alert("Vote successful!");
      closeModal();
    } catch (error) {
      console.error("Error voting:", error);
      alert("Voting failed!");
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading songs</p>;

  return (
    <main className="w-full min-h-screen flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Top Songs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.length > 0 ? (
          songs.map((song, index) => (
            <div key={index} className="p-4 border border-gray-300 rounded-lg shadow-md w-80">
              <img
                src={`${IPFS_GATEWAY}${song.coverCid}`}
                alt={song.songName}
                className="w-full h-40 object-cover rounded-md"
              />
              <h2 className="text-lg font-semibold mt-2">{song.songName}</h2>
              <p className="text-gray-600">By {song.artist}</p>
              <p className="text-gray-500">{song.description}</p>

              {/* Votes & Funding Info */}
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

              <p className="text-sm text-gray-400 mt-2">Artist Address: {song.artistaddress}</p>
              <button
                onClick={() => openModal(index)}
                className="bg-blue-600 text-white px-4 py-2 mt-3 rounded-md hover:bg-blue-700 w-full"
              >
                Fund & Vote
              </button>
            </div>
          ))
        ) : (
          <p>No songs found.</p>
        )}
      </div>

      {/* Modal for Funding */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Enter Funding Amount</h2>
            <input
              type="number"
              placeholder="Enter ETH amount"
              value={fundingAmount}
              onChange={(e) => setFundingAmount(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            <div className="flex justify-end gap-4 mt-4">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-400 rounded-md">Cancel</button>
              <button onClick={handleVote} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Fund</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
