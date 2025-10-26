import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FHEVMProvider } from 'fhevm-sdk/react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';
import Landing from './pages/Landing';
import DApp from './pages/DApp';

const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  connectors: [injected()],
});

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <FHEVMProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/app" element={<DApp />} />
            </Routes>
          </BrowserRouter>
        </FHEVMProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;