/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          global: 'global/window',
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }

    // Make fhevm-sdk client-only
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        'fhevm-sdk': 'fhevm-sdk',
        'fhevm-sdk/react': 'fhevm-sdk/react',
        '@zama-fhe/relayer-sdk': '@zama-fhe/relayer-sdk',
        '@zama-fhe/relayer-sdk/web': '@zama-fhe/relayer-sdk/web',
      });
    }

    return config;
  },
};

module.exports = nextConfig;
