/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  webpack: (config, { isServer }) => {
    // MetaMask SDK optionally requires React Native async-storage; stub for web.
    config.resolve.alias["@react-native-async-storage/async-storage"] = path.join(
      __dirname,
      "lib",
      "async-storage-stub.js"
    );
    return config;
  },
};

module.exports = nextConfig;
