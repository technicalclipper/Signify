"use client";
import { Oswald, Londrina_Solid } from "next/font/google"; // Importing Bangers font
import "./globals.css";

import { config } from "../lib/wagmiConfig";
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()


const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: "400",
});

const londrina = Londrina_Solid({
  variable: "--font-londrina",
  subsets: ["latin"],
  weight: "400",
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <body className={`${londrina.className} `}>
      
      <WagmiProvider config={config}> 
        <QueryClientProvider client={queryClient}> 
          {children} 
        </QueryClientProvider> 
      </WagmiProvider>
      </body>
    </html>
  );
}
