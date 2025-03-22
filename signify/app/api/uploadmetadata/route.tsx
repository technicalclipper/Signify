import { NextResponse, NextRequest } from "next/server";
import { pinata } from "@/utils/config";

const IPFS_GATEWAY = "https://tan-adjacent-mammal-701.mypinata.cloud/ipfs/";
export async function POST(request: NextRequest) {
    try {
        const data = await request.json(); // Expecting metadata JSON
        const { cid } = await pinata.upload.public.json(data);
        const url = await pinata.gateways.public.convert(cid);
        return NextResponse.json({ url }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
