import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FHEVMProvider } from '@fhevm-sdk/core/react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/config/wagmi';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TipMyst - Confidential Tipping Platform',
  description: 'Send encrypted tips to your favorite creators using FHEVM',
};

const queryClient = new QueryClient();

// FHEVM Configuration
const fhevmConfig = {
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111'),
  gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL,
  networkUrl: process.env.NEXT_PUBLIC_RPC_URL,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <FHEVMProvider config={fhevmConfig}>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </div>
            </FHEVMProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}