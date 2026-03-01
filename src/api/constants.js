// src/api/constants.js

export const DBB_CONTRACTS = [
  {
    name: "DBB Contract 1",
    // Ensure DBB_CONTRACT_1 is set in your .env
    address: process.env.DBB_CONTRACT_1 || "0x79dc6c81e72d0000ADbDD418c3FD9972a11aCB84",
  },
  {
    name: "DBB Contract 2",
    // Ensure DBB_CONTRACT_2 is set in your .env
    address: process.env.DBB_CONTRACT_2 || "0xb1ef32e8b63b7f9b06bd6e8c0198c4edcc0a14f3",
  },
];

export const NETWORKS = {
  ethereum: {
    name: "Ethereum",
    chainId: 1,
    alchemyApiKey: process.env.ALCHEMY_ETH_API_KEY,
    alchemyNetwork: "eth-mainnet",
    rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ETH_API_KEY}`,
    explorerUrl: "https://etherscan.io/address/",
  },
  base: {
    name: "Base",
    chainId: 8453,
    alchemyApiKey: process.env.ALCHEMY_BASE_API_KEY,
    alchemyNetwork: "base-mainnet",
    rpcUrl: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_BASE_API_KEY}`,
    explorerUrl: "https://basescan.org/address/",
  },
  arbitrum: {
    name: "Arbitrum",
    chainId: 42161,
    alchemyApiKey: process.env.ALCHEMY_ARB_API_KEY,
    alchemyNetwork: "arb-mainnet",
    rpcUrl: `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ARB_API_KEY}`,
    explorerUrl: "https://arbiscan.io/address/",
  },
};

export const EXCLUSION_KEYWORDS = [
  "whitelist",
  "allowlist",
  "merkleroot",
  "merkleproof",
  "merkle",
  "wl",
  "presale",
  "privateMint",
  "allowlisted",
  "whitelisted",
];


const allowedWalletsString = process.env.USER_WALLET_ADDRESSES || "";
export const ALLOWED_WALLETS = allowedWalletsString
  .split(",")
  .map((address) => address.trim().toLowerCase())
  .filter((address) => address.length > 0);