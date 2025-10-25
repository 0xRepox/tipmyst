import { defineConfig } from 'tsup';

export default defineConfig([
  // Core package
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['@zama-fhe/relayer-sdk', '@zama-fhe/relayer-sdk/web', 'ethers'],
  },
  // React package
  {
    entry: ['src/react/index.ts'],
    format: ['cjs', 'esm'],
    dts: false,
    splitting: false,
    sourcemap: true,
    outDir: 'dist/react',
    external: ['@zama-fhe/relayer-sdk', '@zama-fhe/relayer-sdk/web', 'ethers', 'react'],
  },
  // Constants package
  {
    entry: ['src/constants/index.ts'],
    format: ['cjs', 'esm'],
    dts: false,
    splitting: false,
    sourcemap: true,
    outDir: 'dist/constants',
  },
]);
