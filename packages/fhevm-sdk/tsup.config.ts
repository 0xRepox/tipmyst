// packages/fhevm-sdk/tsup.config.ts

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/adapters/react/index.ts',
    'src/components/index.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'fhevmjs', 'ethers'],
});