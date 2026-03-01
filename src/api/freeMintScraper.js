import { ethers } from "ethers";
import {
  NETWORKS,
  EXCLUSION_KEYWORDS,
} from "./constants.js";
import {
  INSPECTION_ABI,
  COMMON_MINT_ABIS,
  MINT_SELECTORS,
  EXCLUSION_SELECTORS,
} from "./abiFragments.js";


const ERC721_INTERFACE = "0x80ac58cd";
const ERC1155_INTERFACE = "0xd9b67a26";

function getProvider(networkKey) {
  const net = NETWORKS[networkKey];
  if (!net.rpcUrl) {
    throw new Error(`Missing RPC URL for ${net.name}.`);
  }
  
  return new ethers.JsonRpcProvider(net.rpcUrl);
}

async function isNFTContract(contractAddress, provider) {
  const iface = new ethers.Interface(["function supportsInterface(bytes4) view returns (bool)"]);
  const contract = new ethers.Contract(contractAddress, iface, provider);

  try {
    const supports721 = await contract.supportsInterface(ERC721_INTERFACE);
    if (supports721) return true;

    const supports1155 = await contract.supportsInterface(ERC1155_INTERFACE);
    if (supports1155) return true;
  } catch (e) {
    return false;
  }
  return false;
}

async function findRecentNFTContracts(networkKey, blockRange = 500) {
  const provider = getProvider(networkKey);

  const latestBlock = await provider.getBlockNumber();
  const fromBlock = latestBlock - blockRange;

  const contracts = [];

  try {
    const transferEventTopic = ethers.id("Transfer(address,address,uint256)");
    const zeroAddressPadded =
      "0x0000000000000000000000000000000000000000000000000000000000000000";

    const logs = await provider.getLogs({
      fromBlock: fromBlock,
      toBlock: latestBlock,
      topics: [transferEventTopic, zeroAddressPadded],
    });

    const uniqueContracts = [...new Set(logs.map((log) => log.address))];

    
    const contractsToCheck = uniqueContracts.slice(0, 30);

    for (const contractAddress of contractsToCheck) {
      try {
        const isNft = await isNFTContract(contractAddress, provider);
        if (!isNft) continue;

        const result = await analyzeContract(
          contractAddress,
          provider,
          networkKey
        );
        if (result) {
          contracts.push(result);
        }
      } catch (error) {
        continue;
      }
    }
  } catch (error) {
    console.error(`Error scanning ${networkKey}: ${error.message}`);
  }

  return contracts;
}

async function analyzeContract(contractAddress, provider, networkKey) {
  const contract = new ethers.Contract(
    contractAddress,
    INSPECTION_ABI,
    provider
  );

  const analysis = {
    address: contractAddress,
    network: NETWORKS[networkKey].name,
    networkKey,
    name: "Unknown",
    symbol: "???",
    mintPrice: null,
    isPublic: false,
    isPaused: false,
    hasMerkle: false,
    mintFunction: null,
    mintABI: null,
    explorerUrl: `${NETWORKS[networkKey].explorerUrl}${contractAddress}`,
  };

  try {
    analysis.name = await contract.name();
  } catch {}
  try {
    analysis.symbol = await contract.symbol();
  } catch {}

  let priceFound = false;
  const priceFunctions = ["mintPrice", "price", "cost", "PRICE", "getPrice"];

  for (const fn of priceFunctions) {
    try {
      const price = await contract[fn]();
      analysis.mintPrice = ethers.formatEther(price);
      priceFound = true;

      if (price > 0n) {
        return null;
      }
      break;
    } catch {
      continue;
    }
  }

  try {
    analysis.isPaused = await contract.paused();
    if (analysis.isPaused) {
      return null;
    }
  } catch {}

  const publicSaleFunctions = [
    "saleIsActive",
    "isPublicSaleActive",
    "publicSaleActive",
    "isActive",
  ];

  for (const fn of publicSaleFunctions) {
    try {
      const isActive = await contract[fn]();
      analysis.isPublic = isActive;
      break;
    } catch {
      continue;
    }
  }

  try {
    const merkleRoot = await contract.merkleRoot();

    if (
      merkleRoot &&
      merkleRoot !==
        "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      analysis.hasMerkle = true;
      return null;
    }
  } catch {}

  const bytecode = await provider.getCode(contractAddress);

  if (bytecode === "0x") {
    return null;
  }

  for (const [selector, name] of Object.entries(EXCLUSION_SELECTORS)) {
    const selectorClean = selector.slice(2);
    if (bytecode.toLowerCase().includes(selectorClean)) {
      const nameLC = name.toLowerCase();
      if (
        EXCLUSION_KEYWORDS.some((keyword) => nameLC.includes(keyword))
      ) {
        return null;
      }
    }
  }

  const bytecodeLC = bytecode.toLowerCase();
  for (const keyword of EXCLUSION_KEYWORDS) {
    const hexKeyword = Buffer.from(keyword).toString("hex");
    if (bytecodeLC.includes(hexKeyword)) {
      return null;
    }
  }

  for (const [selector, funcName] of Object.entries(MINT_SELECTORS)) {
    const selectorClean = selector.slice(2);
    if (bytecodeLC.includes(selectorClean)) {
      analysis.mintFunction = funcName;
      analysis.mintABI = COMMON_MINT_ABIS.find((abi) =>
        abi.includes(funcName.split("(")[0])
      );
      break;
    }
  }

  if (!analysis.mintFunction) {
    return null;
  }

  if (priceFound && analysis.mintPrice !== "0.0") {
    return null;
  }

  if (!priceFound) {
    analysis.mintPrice = "0 (unverified)";
  }

  return analysis;
}

export async function scrapeFreeMints(blockRange = 500) {
  const allResults = [];
  const networksToScan = ["ethereum", "base", "arbitrum"];

  for (const networkKey of networksToScan) {
    if (!NETWORKS[networkKey].rpcUrl) {
      console.warn(`Skipping ${networkKey}: Missing RPC URL.`);
      continue;
    }

    try {
      const results = await findRecentNFTContracts(networkKey, blockRange);
      allResults.push(...results);
    } catch (error) {
      console.error(`Error scanning ${networkKey}: ${error.message}`);
    }
  }

  return allResults;
}

