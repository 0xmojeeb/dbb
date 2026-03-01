import { checkTokenGate } from "./api/tokenGate.js";
import { scrapeFreeMints } from "./api/freeMintScraper.js";
import { ALLOWED_WALLETS } from "./api/constants.js";

async function runPlatformLogic() {
  const walletAddress = ALLOWED_WALLETS[0];

  if (!walletAddress) {
    console.error("❌ Error: No default wallet address available!");
    return;
  }

  console.log(`🚀 Starting platform logic for: ${walletAddress}`);

  
  let gateResult;
  try {
    console.log("━━━ TASK 1: TOKEN GATE ━━━");
    gateResult = await checkTokenGate(walletAddress);
  } catch (error) {
    console.error("❌ Token Gate call failed:", error.message);
    
    return;
  }

  if (!gateResult.granted) {
    console.log("🛑 Access Denied: Cannot proceed to DBB Scraper.");
    return;
  }

  
  try {
    console.log("━━━ TASK 2: MINT SCRAPER ━━━");
    const blockRange = 9;

    console.log(`🎫 Access verified! Starting free mint scan (${blockRange} blocks)...`);
    
    
    const freeMints = await scrapeFreeMints(blockRange);

    
    console.log("📊 SESSION SUMMARY");
    console.log(`Wallet: ${walletAddress}`);
    console.log(`DBB NFTs Held: ${gateResult.totalBalance}`);
    console.log(`Access: ${gateResult.granted ? "Granted" : "Denied"}`);
    console.log(`Free Mints Found: ${freeMints.length}`);
    console.log(`Blocks Scanned: ${blockRange} per network`);

  } catch (error) {
    console.error("❌ Mint Scraper call failed:", error.message);
  }
}

// runPlatformLogic().catch(console.error);