"use client";

import { useState } from "react";
import { useWriteContract,useAccount } from 'wagmi'
import {contractaddress,abi} from '../../lib/SongContract'

export default function Home() {
  const [songFile, setSongFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [songName, setSongName] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [songCid, setSongCid] = useState("");
  const [coverCid, setCoverCid] = useState("");
  const [metadataCid, setMetadataCid] = useState("");
  const [uploading, setUploading] = useState(false);
  const { writeContract } = useWriteContract()
  const { address, isConnected } = useAccount();
  const uploadFile = async () => {
    try {
      if (!songFile || !coverImage || !songName || !artist) {
        alert("Please fill all fields and select both files.");
        return;
      }

      setUploading(true);
      const data = new FormData();
      data.set("songFile", songFile);
      data.set("coverImage", coverImage);
      data.set("songName", songName);
      data.set("artist", artist);
      data.set("description", description);
      data.set("artistaddress",address!);

      const uploadRequest = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const response = await uploadRequest.json();
      setSongCid(response.songCid);
      setCoverCid(response.coverCid);
      setMetadataCid(response.metadataCid);
      setUploading(false);
      
      writeContract({ 
        abi,
        address: contractaddress,
        functionName: 'uploadSong',
        args: [
          response.metadataCid
        ],
     })

    } catch (e) {
      console.log(e);
      setUploading(false);
      alert("Trouble uploading file");
    }
  };

  const IPFS_GATEWAY = "https://tan-adjacent-mammal-701.mypinata.cloud/ipfs/";

  return (
    <main className="w-full min-h-screen m-auto flex flex-col justify-center items-center gap-4">
      <input type="file" accept="audio/*" onChange={(e) => setSongFile(e.target?.files?.[0] || null)} />
      <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target?.files?.[0] || null)} />
      <input type="text" placeholder="Song Name" value={songName} onChange={(e) => setSongName(e.target.value)} />
      <input type="text" placeholder="Artist Name" value={artist} onChange={(e) => setArtist(e.target.value)} />
      <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <button type="button" disabled={uploading} onClick={uploadFile}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {songCid && (
        <p>Song CID: <a href={`${IPFS_GATEWAY}${songCid}`} target="_blank">{songCid}</a></p>
      )}
      {coverCid && (
        <p>Cover CID: <a href={`${IPFS_GATEWAY}${coverCid}`} target="_blank">{coverCid}</a></p>
      )}
      {metadataCid && (
        <p>Metadata CID: <a href={`${IPFS_GATEWAY}${metadataCid}`} target="_blank">{metadataCid}</a></p>
      )}
    </main>
  );
}
