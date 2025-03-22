"use client";

import styles from "./topsongs.module.css"; // Import styles
import { useReadContract, useWriteContract, useAccount } from "wagmi";
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
  const { data } = useReadContract({
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
  const { address } = useAccount();

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
        value: BigInt(Math.round(parseFloat(dealDetails.upfrontPayment) * 1e18)),
      });

      alert("Deal proposed successfully!");
      closeDealModal();
    } catch (error) {
      console.error("Error proposing deal:", error);
      alert("Deal proposal failed!");
    }
  };

  return (
    <main className={styles.pageContainer}>
      <div className={styles.cardContainer}>
        <h1 className={styles.title}>Top Songs</h1>
        <div className={styles.songsGrid}>
          {songs.length > 0 ? (
            songs.map((song, index) => (
              <div key={index} className={styles.songCard}>
                <img src={`${IPFS_GATEWAY}${song.coverCid}`} alt={song.songName} className={styles.songImage} />
                <h2 className={styles.songName}>{song.songName}</h2>
                <p className={styles.songArtist}>By {song.artist}</p>
                <p className={styles.songDescription}>{song.description}</p>

                <div className={styles.songDetails}>
                  <p><strong>Votes:</strong> {song.votes}</p>
                  <p><strong>Total Funding:</strong> {song.totalFunding} ETH</p>
                </div>

                <audio controls className={styles.audio}>
                  <source src={`${IPFS_GATEWAY}${song.songCid}`} type="audio/mpeg" />
                </audio>

                <button onClick={() => openModal(index)} className={styles.voteButton}>Fund & Vote</button>
                <button onClick={() => openDealModal(index)} className={styles.dealButton}>Propose Deal</button>
              </div>
            ))
          ) : (
            <p>No songs found.</p>
          )}
        </div>
      </div>
    </main>
  );
}
