import { ethers } from "ethers";
import chalk from "chalk";
import { DBB_CONTRACTS, NETWORKS, ALLOWED_WALLETS } from "./api/constants.js";
import { ERC721_BALANCE_ABI } from "./api/abiFragments.js";

/**
 * 
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
    console.log(chalk.green(`\n✅ Wallet ${walletAddress} is on the whitelist. Access granted.`));
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
      message: "❌ Missing ALCHEMY_BASE_API_KEY in .env file.",
    };
  }

  
  const provider = new ethers.JsonRpcProvider(NETWORKS.base.rpcUrl);

  const holdings = [];
  let totalBalance = 0;

  console.log(chalk.cyan("\n🔐 DBB Token Gate — Checking On-Chain Holdings...\n"));
  console.log(chalk.gray(`   Wallet: ${walletAddress}`));
  console.log(chalk.gray(`   Network: Base Mainnet\n`));
  
  for (const contractInfo of DBB_CONTRACTS) {
    try {
      console.log(chalk.yellow(`   Checking ${contractInfo.name}...`));
      
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

      if (balanceNum > 0) {
        console.log(
          chalk.green(`   ✅ Found ${balanceNum} ${symbol} token(s)\n`)
        );
      } else {
        console.log(chalk.red(`   ⛔ No tokens found\n`));
      }
    } catch (error) {
      console.log(
        chalk.red(`   ⚠️  Error checking ${contractInfo.name}: ${error.message}\n`)
      );
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

  
  console.log(chalk.bold("━".repeat(55)));
  if (granted) {
    console.log(chalk.bgGreen.black.bold(`\n   ${result.message}   \n`));
  } else {
    console.log(chalk.bgRed.white.bold(`\n   ${result.message}   \n`));
    console.log(chalk.yellow("   Get your DBB NFT:"));
    console.log(
      chalk.gray(
        `   • Contract: ${NETWORKS.base.explorerUrl}${DBB_CONTRACTS[0].address}`
      )
    );
  }
  console.log(chalk.bold("━".repeat(55)));

  return result;
}

