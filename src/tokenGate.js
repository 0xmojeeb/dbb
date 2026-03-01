import { ethers } from "ethers";
import chalk from "chalk";

import { DBB_CONTRACTS, NETWORKS, USER_WALLET } from "./api/constants.js";
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

  if (!NETWORKS.ethereum.alchemyApiKey) {
    return {
      granted: false,
      holdings: [],
      message: "❌ Missing ALCHEMY_ETH_API_KEY in .env file.",
    };
  }

  
  const provider = new ethers.JsonRpcProvider(NETWORKS.base.rpcUrl);

  const holdings = [];
  let totalBalance = 0;

  console.log(chalk.cyan("\n🔐 DBB Token Gate — Checking Access...\n"));
  console.log(chalk.gray(`   Wallet: ${walletAddress}`));
  console.log(chalk.gray(`   Network: Base Mainnet\n`));

  
  for (const contractInfo of DBB_CONTRACTS) {
    try {
      console.log(chalk.yellow(`   Checking ${contractInfo.name}...`));
      console.log(chalk.gray(`   Contract: ${contractInfo.address}`));

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
      } catch {
        
      }

      
      let symbol = "???";
      try {
        symbol = await contract.symbol();
      } catch {
       
      }

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
        `   • Contract 1: ${NETWORKS.ethereum.explorerUrl}${DBB_CONTRACTS[0].address}`
      )
    );
    console.log(
      chalk.gray(
        `   • Contract 2: ${NETWORKS.ethereum.explorerUrl}${DBB_CONTRACTS[1].address}\n`
      )
    );
  }
  console.log(chalk.bold("━".repeat(55)));

  return result;
}


if (process.argv[1].includes("tokenGate")) {
  const wallet = process.argv[2] || USER_WALLET;

  if (!wallet) {
    console.log(chalk.red("\n❌ Please provide a wallet address:"));
    console.log(chalk.gray("   node src/tokenGate.js 0xYourWalletAddress"));
    console.log(chalk.gray("   OR set USER_WALLET_ADDRESS in .env\n"));
    process.exit(1);
  }

  checkTokenGate(wallet).then((result) => {
    process.exit(result.granted ? 0 : 1);
  });
}