import { ethers } from "ethers";
import { DBB_CONTRACTS, NETWORKS, ALLOWED_WALLETS } from "./constants.js";
import { ERC721_BALANCE_ABI } from "./abiFragments.js";

/**
 * @param {string} walletAddress 
 * @returns {Object} 
 */
export async function checkTokenGate(walletAddress) {
 
  if (!walletAddress || !ethers.isAddress(walletAddress)) {
    return {
      granted: false,
      holdings: [],
      message: "❌ Invalid wallet address provided.",
    };
  }

  
  const normalizedAddress = walletAddress.toLowerCase();
  if (ALLOWED_WALLETS.includes(normalizedAddress)) {
    
    return {
        granted: true,
        holdings: [],
        totalBalance: 999, 
        message: "🎉 ACCESS GRANTED — Welcome to DBB, VIP!",
    };
  }


  if (!NETWORKS.base.alchemyApiKey) {
    return {
      granted: false,
      holdings: [],
      message: "❌ Missing ALCHEMY_BASE_API_KEY in configuration.",
    };
  }

  
  const provider = new ethers.JsonRpcProvider(NETWORKS.base.rpcUrl);

  const holdings = [];
  let totalBalance = 0;
  
  for (const contractInfo of DBB_CONTRACTS) {
    try {
      const contract = new ethers.Contract(
        contractInfo.address,
        ERC721_BALANCE_ABI,
        provider
      );

      const balance = await contract.balanceOf(walletAddress);
      const balanceNum = Number(balance);

      let collectionName = contractInfo.name;
      try {
        collectionName = await contract.name();
      } catch {}

      let symbol = "???";
      try {
        symbol = await contract.symbol();
      } catch {}

      holdings.push({
        contract: contractInfo.address,
        name: collectionName,
        symbol,
        balance: balanceNum,
      });

      totalBalance += balanceNum;
    } catch (error) {
      holdings.push({
        contract: contractInfo.address,
        name: contractInfo.name,
        symbol: "ERR",
        balance: 0,
        error: error.message,
      });
    }
  }

  const granted = totalBalance > 0;

  const result = {
    granted,
    holdings,
    totalBalance,
    message: granted
      ? `🎉 ACCESS GRANTED — Welcome to DBB, degen! (${totalBalance} NFT(s) found)`
      : `🚫 ACCESS DENIED — You need at least 1 DBB NFT to enter.`,
  };

  return result;
}
