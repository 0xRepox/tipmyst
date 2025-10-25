import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { FHEVMClient, type FHEVMConfig } from '../core/fhevm';
import type { FhevmInstance } from '@zama-fhe/relayer-sdk';

interface FHEVMContextValue {
  client: FHEVMClient | null;
  instance: FhevmInstance | null;
  isInitialized: boolean;
  isInitializing: boolean;
  error: Error | null;
  init: (provider?: BrowserProvider) => Promise<void>;
}

const FHEVMContext = createContext<FHEVMContextValue | null>(null);

interface FHEVMProviderProps {
  children: React.ReactNode;
  config?: Partial<FHEVMConfig>;
  autoInit?: boolean;
}

export function FHEVMProvider({ children, config, autoInit = false }: FHEVMProviderProps) {
  const [client] = useState(() => new FHEVMClient(config));
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const init = useCallback(async (provider?: BrowserProvider) => {
    if (client.isInitialized()) {
      console.warn('FHEVM already initialized');
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      await client.init(provider);
      setInstance(client.getInstance());
      console.log('✅ FHEVM initialized in provider');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize FHEVM');
      setError(error);
      console.error('❌ FHEVM initialization failed:', error);
      throw error;
    } finally {
      setIsInitializing(false);
    }
  }, [client]);

  useEffect(() => {
    if (autoInit && !client.isInitialized() && !isInitializing) {
      init().catch(console.error);
    }
  }, [autoInit, client, isInitializing, init]);

  const value: FHEVMContextValue = {
    client,
    instance,
    isInitialized: instance !== null,
    isInitializing,
    error,
    init,
  };

  return <FHEVMContext.Provider value={value}>{children}</FHEVMContext.Provider>;
}

export function useFHEVM() {
  const context = useContext(FHEVMContext);
  if (!context) {
    throw new Error('useFHEVM must be used within FHEVMProvider');
  }
  return context;
}

export function useFHEVMInstance() {
  const { instance, isInitialized, isInitializing, error } = useFHEVM();
  if (error) throw error;
  if (!isInitialized && !isInitializing) {
    throw new Error('FHEVM not initialized. Call init() first or set autoInit={true}');
  }
  if (!instance) throw new Error('FHEVM instance not available');
  return instance;
}
