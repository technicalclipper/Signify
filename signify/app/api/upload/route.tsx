import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config";

const IPFS_GATEWAY = "https://tan-adjacent-mammal-701.mypinata.cloud/ipfs/";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const songFile: File | null = data.get("songFile") as unknown as File;
    const coverImage: File | null = data.get("coverImage") as unknown as File;
    const songName = data.get("songName") as string;
    const artist = data.get("artist") as string;
    const description = data.get("description") as string;
    const artistaddress= data.get("artistaddress") as string;

    if (!songFile || !coverImage || !songName || !artist) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upload song file to Pinata
    const { cid: songCid } = await pinata.upload.public.file(songFile);
    const songUrl = `${IPFS_GATEWAY}${songCid}`;

    // Upload cover image to Pinata
    const { cid: coverCid } = await pinata.upload.public.file(coverImage);
    const coverUrl = `${IPFS_GATEWAY}${coverCid}`;

    // Upload song metadata as JSON
    const metadata = { songName, artist, description, songCid, coverCid,artistaddress };
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
    const metadataFile = new File([metadataBlob], "metadata.json");

    const { cid: metadataCid } = await pinata.upload.public.file(metadataFile);
    const metadataUrl = `${IPFS_GATEWAY}${metadataCid}`;

    return NextResponse.json({ 
      success: true, 
      songCid, 
      coverCid, 
      metadataCid,
      songUrl, 
      coverUrl, 
      metadataUrl 
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
