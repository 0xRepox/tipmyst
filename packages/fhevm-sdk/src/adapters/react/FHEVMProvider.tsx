// packages/fhevm-sdk/src/adapters/react/FHEVMProvider.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FHEVMClient } from '../../core';
import type { FHEVMConfig, FHEVMClientInstance } from '../../types';

interface FHEVMContextValue {
  client: FHEVMClientInstance | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
}

const FHEVMContext = createContext<FHEVMContextValue | null>(null);

interface FHEVMProviderProps {
  config: FHEVMConfig;
  children: ReactNode;
}

/**
 * FHEVM Provider - React Context Provider for FHEVM SDK
 * 
 * Wraps your app to provide FHEVM functionality to all child components.
 * Handles initialization, loading states, and error handling.
 * 
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <FHEVMProvider config={{ chainId: 11155111 }}>
 *       <YourApp />
 *     </FHEVMProvider>
 *   );
 * }
 * ```
 */
export function FHEVMProvider({ config, children }: FHEVMProviderProps) {
  const [client, setClient] = useState<FHEVMClientInstance | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeClient() {
      try {
        setIsLoading(true);
        setError(null);
        
        const fhevmClient = await FHEVMClient.create(config);
        
        if (mounted) {
          setClient(fhevmClient);
          setIsInitialized(true);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          console.error('Failed to initialize FHEVM client:', err);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initializeClient();

    return () => {
      mounted = false;
    };
  }, [config.chainId, config.gatewayUrl]);

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#fee', 
        border: '1px solid #fcc',
        borderRadius: '4px',
        color: '#c00'
      }}>
        <h2>⚠️ FHEVM Initialization Error</h2>
        <p>{error.message}</p>
        <details>
          <summary>Details</summary>
          <pre>{error.stack}</pre>
        </details>
      </div>
    );
  }

  return (
    <FHEVMContext.Provider value={{ client, isInitialized, isLoading, error }}>
      {children}
    </FHEVMContext.Provider>
  );
}

/**
 * Hook to access FHEVM context
 * Internal use - consumers should use specific hooks like useFHEVM
 */
export function useFHEVMContext(): FHEVMContextValue {
  const context = useContext(FHEVMContext);
  
  if (!context) {
    throw new Error('useFHEVMContext must be used within FHEVMProvider');
  }
  
  return context;
}